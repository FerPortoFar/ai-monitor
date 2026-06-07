import { Router } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DEMO_DATA, DEMO_HISTORY, DEMO_TRENDS } from '../data/demoData.js';
import { readAgents } from './agents.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATS_DIR  = join(__dirname, '../data/stats');
const router     = Router();

function dateStr(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}
function today() { return new Date().toISOString().slice(0, 10); }
function dayLabel(iso) {
  return ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(iso + 'T12:00:00').getDay()];
}
function readStats(token) {
  const f = join(STATS_DIR, `${token}.json`);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

// ── Fechas de períodos ─────────────────────────────────────────────────────────
function getCurrDates(period) {
  if (period === 'today') return [today()];
  if (period === 'week')  return Array.from({ length: 7  }, (_, i) => dateStr(6  - i));
  return                         Array.from({ length: 28 }, (_, i) => dateStr(27 - i));
}
function getPrevDates(period) {
  if (period === 'today') return [dateStr(1)];
  if (period === 'week')  return Array.from({ length: 7  }, (_, i) => dateStr(7  + i));
  return                         Array.from({ length: 28 }, (_, i) => dateStr(28 + i));
}
function sumOutputTokens(agentStats, dates) {
  const set = new Set(dates);
  let t = 0;
  for (const proj of Object.values(agentStats.projects || {}))
    for (const [d, v] of Object.entries(proj.dailyActivity || {}))
      if (set.has(d)) t += v;
  return t;
}
function computeTrend(curr, prev) {
  if (!prev) return null;
  return parseFloat(((curr - prev) / prev * 100).toFixed(1));
}

// ── Construcción de datos por dev ──────────────────────────────────────────────
function buildDevData(agentStats, period) {
  const projects = agentStats.projects || {};
  let totalInput = 0, totalOutput = 0, totalReqs = 0, totalCost = 0;
  const modelUsage = {}, dailyAct = {}, hourCounts = {}, taskCounts = {};

  for (const proj of Object.values(projects)) {
    totalInput  += proj.tokens?.input  || 0;
    totalOutput += proj.tokens?.output || 0;
    totalReqs   += proj.requests || 0;
    totalCost   += proj.costUSD  || 0;
    for (const [m, v] of Object.entries(proj.modelUsage    || {})) modelUsage[m] = (modelUsage[m] || 0) + v;
    for (const [t, v] of Object.entries(proj.taskCounts    || {})) taskCounts[t] = (taskCounts[t] || 0) + v;
    for (const [d, v] of Object.entries(proj.dailyActivity || {})) dailyAct[d]   = (dailyAct[d]   || 0) + v;
    for (const [h, v] of Object.entries(proj.hourCounts    || {})) hourCounts[h] = (hourCounts[h] || 0) + v;
  }

  let labels, activity;
  if (period === 'today') {
    labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}h`);
    const totalToday = dailyAct[today()] || 0;
    const totalH     = Object.values(hourCounts).reduce((s, v) => s + v, 0) || 1;
    activity = Array.from({ length: 24 }, (_, h) =>
      Math.round(totalToday * ((hourCounts[String(h)] || 0) / totalH))
    );
  } else if (period === 'week') {
    const dates = Array.from({ length: 7 }, (_, i) => dateStr(6 - i));
    labels   = dates.map(dayLabel);
    activity = dates.map(d => dailyAct[d] || 0);
  } else {
    const weeks = [
      Array.from({ length: 7 }, (_, i) => dateStr(27 - i)),
      Array.from({ length: 7 }, (_, i) => dateStr(20 - i)),
      Array.from({ length: 7 }, (_, i) => dateStr(13 - i)),
      Array.from({ length: 7 }, (_, i) => dateStr(6  - i)),
    ];
    labels   = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    activity = weeks.map(w => w.reduce((s, d) => s + (dailyAct[d] || 0), 0));
  }

  const projectsOut = Object.fromEntries(
    Object.entries(projects).map(([k, p]) => [k, {
      displayName: p.displayName || k,
      tokens:      p.tokens      || { input: 0, output: 0 },
      costUSD:     p.costUSD     || 0,
      requests:    p.requests    || 0,
      modelUsage:  p.modelUsage  || {},
      lastWorked:  p.lastWorked  || null,
    }])
  );

  return {
    labels,
    devData: {
      tokens: { input: totalInput, output: totalOutput },
      requests: totalReqs,
      costUSD: totalCost,
      tasks: taskCounts,
      activity,
      modelUsage,
      projects: projectsOut,
    },
  };
}

// ── Historial 6 meses ──────────────────────────────────────────────────────────
function getLastNMonths(n) {
  const months = [], now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key:   `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`,
      label: dt.toLocaleDateString('es-AR', { month: 'short' }),
    });
  }
  return months;
}

function buildHistory(agentStats) {
  const months = getLastNMonths(6);
  const projects = agentStats.projects || {};
  let totalOutput = 0, totalCost = 0;
  const monthlyTokens = Object.fromEntries(months.map(m => [m.key, 0]));

  for (const proj of Object.values(projects)) {
    totalOutput += proj.tokens?.output || 0;
    totalCost   += proj.costUSD || 0;
    for (const [date, tokens] of Object.entries(proj.dailyActivity || {})) {
      const mk = date.slice(0, 7);
      if (mk in monthlyTokens) monthlyTokens[mk] += tokens;
    }
  }

  const costPerToken = totalOutput > 0 ? totalCost / totalOutput : 0;
  return {
    labels: months.map(m => m.label),
    monthlyCost: months.map(m => parseFloat((monthlyTokens[m.key] * costPerToken).toFixed(2))),
  };
}

// ── Ruta historial ─────────────────────────────────────────────────────────────
router.get('/history', (_req, res) => {
  const agents = readAgents();
  if (agents.length === 0) return res.json(DEMO_HISTORY);

  const histories = agents.map(a => {
    const stats = readStats(a.token);
    return stats ? buildHistory(stats) : null;
  });

  if (!histories.some(h => h !== null)) return res.json(DEMO_HISTORY);

  const firstReal = histories.find(h => h !== null);
  res.json({
    months:   firstReal.labels,
    devCosts: histories.map(h => h ? h.monthlyCost : new Array(6).fill(0)),
  });
});

// ── Ruta principal ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const period  = ['today', 'week', 'month'].includes(req.query.period) ? req.query.period : 'week';
  const agents  = readAgents();

  if (agents.length === 0)
    return res.json({ ...DEMO_DATA[period], configuredIndices: [0,1,2], devTrends: DEMO_TRENDS[period] });

  const results = agents.map(a => {
    const stats = readStats(a.token);
    return stats ? buildDevData(stats, period) : null;
  });

  if (!results.some(r => r !== null))
    return res.json({ ...DEMO_DATA[period], configuredIndices: [0,1,2], devTrends: DEMO_TRENDS[period] });

  const firstReal = results.find(r => r !== null);
  const labels    = firstReal.labels;
  const configuredIndices = results.map((r, i) => r !== null ? i : -1).filter(i => i !== -1);

  const currDates = getCurrDates(period);
  const prevDates = getPrevDates(period);

  const devTrends = agents.map(a => {
    const stats = readStats(a.token);
    if (!stats) return { tokensDelta: null, costDelta: null };
    const curr = sumOutputTokens(stats, currDates);
    const prev = sumOutputTokens(stats, prevDates);
    const delta = computeTrend(curr, prev);
    return { tokensDelta: delta, costDelta: delta };
  });

  const empty = {
    tokens: { input: 0, output: 0 }, requests: 0, costUSD: 0,
    tasks: {}, activity: new Array(labels.length).fill(0), modelUsage: {}, projects: {},
  };
  const developers = results.map(r => r ? r.devData : empty);

  res.json({ labels, developers, configuredIndices, devTrends });
});

router.post('/refresh', (_req, res) => res.json({ ok: true }));

export default router;
