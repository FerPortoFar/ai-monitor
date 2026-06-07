import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const MODEL_LABELS = {
  'claude-sonnet-4-6':         'Sonnet 4.6',
  'claude-haiku-4-5-20251001': 'Haiku 4.5',
  'claude-opus-4-6':           'Opus 4.6',
  'claude-sonnet-4-20250514':  'Sonnet 3.7',
};

function labelModel(id) {
  return MODEL_LABELS[id] || id;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dateStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

function dayLabel(dateIso) {
  const d = new Date(dateIso + 'T12:00:00');
  return ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d.getDay()];
}

// Lee todos los .jsonl de un directorio recursivamente
function findJsonlFiles(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) results.push(...findJsonlFiles(full));
      else if (entry.endsWith('.jsonl')) results.push(full);
    }
  } catch { /* sin permiso o no existe */ }
  return results;
}

// Parsea directamente la carpeta ~/.claude del desarrollador
export function parseFromClaudeDir(claudeDir) {
  if (!claudeDir || !existsSync(claudeDir)) return null;

  const projectsDir = join(claudeDir, 'projects');
  if (!existsSync(projectsDir)) return null;

  const files = findJsonlFiles(projectsDir);
  if (files.length === 0) return null;

  const byDate    = {};   // date → { tokens: {model: outToks}, messageCount }
  const modelUsage = {};  // model → { inputTokens, outputTokens, cacheCreation }
  const hourCounts = {};  // hour → count

  for (const file of files) {
    let lines;
    try { lines = readFileSync(file, 'utf8').split('\n').filter(l => l.trim()); }
    catch { continue; }

    for (const line of lines) {
      let entry;
      try { entry = JSON.parse(line); } catch { continue; }

      if (entry.type !== 'assistant') continue;
      const usage = entry.message?.usage;
      if (!usage) continue;

      const model     = entry.message?.model || 'unknown';
      const timestamp = entry.timestamp;
      if (!timestamp) continue;

      const date = timestamp.slice(0, 10);
      const hour = parseInt(timestamp.slice(11, 13), 10);

      // byDate tokens (output por modelo)
      if (!byDate[date]) byDate[date] = { tokens: {}, messageCount: 0 };
      byDate[date].tokens[model] = (byDate[date].tokens[model] || 0) + (usage.output_tokens || 0);
      byDate[date].messageCount++;

      // modelUsage totales
      if (!modelUsage[model]) modelUsage[model] = { inputTokens: 0, outputTokens: 0, cacheCreationInputTokens: 0 };
      modelUsage[model].inputTokens              += (usage.input_tokens || 0);
      modelUsage[model].outputTokens             += (usage.output_tokens || 0);
      modelUsage[model].cacheCreationInputTokens += (usage.cache_creation_input_tokens || 0);

      // hourCounts
      if (!isNaN(hour)) hourCounts[String(hour)] = (hourCounts[String(hour)] || 0) + 1;
    }
  }

  // Ratio input/output global
  const globalOut = Object.values(modelUsage).reduce((s, m) => s + m.outputTokens, 0);
  const globalIn  = Object.values(modelUsage).reduce((s, m) => s + m.inputTokens + m.cacheCreationInputTokens, 0);
  const inRatio   = globalOut > 0 ? globalIn / globalOut : 0.15;

  // Distribución horaria normalizada
  const totalHours = Object.values(hourCounts).reduce((s, v) => s + v, 0) || 1;
  const hourDist   = Array.from({ length: 24 }, (_, h) => (hourCounts[String(h)] || 0) / totalHours);

  // Requests por modelo
  const modelReqs = {};
  for (const [model, data] of Object.entries(modelUsage)) {
    const label = labelModel(model);
    modelReqs[label] = (modelReqs[label] || 0) + Math.round(data.outputTokens / 200);
  }

  function buildDevData(dates) {
    let totalOut = 0, totalReq = 0;
    const dailyOut   = [];
    const modelTotals = {};

    for (const date of dates) {
      const entry = byDate[date] || {};
      const toks  = entry.tokens || {};

      const dayOut = Object.values(toks).reduce((s, v) => s + v, 0);
      dailyOut.push(dayOut);
      totalOut += dayOut;
      totalReq += entry.messageCount ? Math.ceil(entry.messageCount / 2) : 0;

      for (const [model, val] of Object.entries(toks)) {
        const lbl = labelModel(model);
        modelTotals[lbl] = (modelTotals[lbl] || 0) + Math.round(val / 200);
      }
    }

    const totalIn  = Math.round(totalOut * inRatio);
    const todayOut = byDate[today()]?.tokens
      ? Object.values(byDate[today()].tokens).reduce((s, v) => s + v, 0)
      : 0;

    return {
      tokens:       { input: totalIn, output: totalOut },
      requests:     totalReq,
      costUSD:      0,
      tasks:        { Código: 0, Debug: 0, Explicación: 0, Revisión: 0, Docs: 0 },
      activity:     dailyOut,
      activityToday: hourDist.map(p => Math.round(todayOut * p)),
      modelUsage:   Object.keys(modelTotals).length ? modelTotals : modelReqs,
    };
  }

  return { byDate, buildDevData, hourDist, modelReqs };
}

export function buildPeriodData(parsed, period) {
  if (!parsed) return null;
  const { buildDevData } = parsed;

  if (period === 'today') {
    const dev = buildDevData([today()]);
    return {
      labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}h`),
      _activityOverride: dev.activityToday,
      _devRaw: dev,
    };
  }

  if (period === 'week') {
    const dates = Array.from({ length: 7 }, (_, i) => dateStr(6 - i));
    const dev   = buildDevData(dates);
    return {
      labels: dates.map(dayLabel),
      _activityOverride: dev.activity,
      _devRaw: dev,
    };
  }

  // month — últimas 4 semanas
  const weeks = [
    Array.from({ length: 7 }, (_, i) => dateStr(27 - i)),
    Array.from({ length: 7 }, (_, i) => dateStr(20 - i)),
    Array.from({ length: 7 }, (_, i) => dateStr(13 - i)),
    Array.from({ length: 7 }, (_, i) => dateStr(6  - i)),
  ];
  const dev = buildDevData(weeks.flat());
  const weeklyActivity = weeks.map(w =>
    w.reduce((s, d) => {
      const toks = parsed.byDate[d]?.tokens || {};
      return s + Object.values(toks).reduce((a, v) => a + v, 0);
    }, 0)
  );
  return {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    _activityOverride: weeklyActivity,
    _devRaw: dev,
  };
}
