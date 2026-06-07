/**
 * AI Monitor Agent
 * Lee los archivos .jsonl de Claude Code y sube las stats al servidor cada 5 minutos.
 * Se instala como Tarea Programada de Windows (ver install-task.js).
 */

const { readFileSync, writeFileSync, existsSync, readdirSync, statSync } = require('fs');
const { join }       = require('path');
const { homedir }    = require('os');
const { randomUUID } = require('crypto');

const CONFIG_FILE    = join(__dirname, 'agent.config.json');
const INTERVAL_MS    = 5 * 60 * 1000;
const SESSION_DAYS   = 30;   // sesiones de los últimos N días
const MAX_SESSIONS   = 500;  // límite de sesiones por upload

// ── Modelos ────────────────────────────────────────────────────────────────────
const MODEL_LABELS = {
  'claude-sonnet-4-6':         'Sonnet 4.6',
  'claude-haiku-4-5-20251001': 'Haiku 4.5',
  'claude-opus-4-6':           'Opus 4.6',
  'claude-sonnet-4-20250514':  'Sonnet 3.7',
};
function labelModel(id) { return MODEL_LABELS[id] || id; }

// ── Costo estimado por modelo (USD / 1M tokens) ────────────────────────────────
// Precios por defecto — se sobreescriben con los del servidor en cada tick
const DEFAULT_COSTS = {
  'claude-sonnet-4-6':         { in: 3.00,  out: 15.00 },
  'claude-haiku-4-5-20251001': { in: 0.80,  out:  4.00 },
  'claude-opus-4-6':           { in: 15.00, out: 75.00 },
  'claude-sonnet-4-20250514':  { in: 3.00,  out: 15.00 },
};
let activeCosts = { ...DEFAULT_COSTS };

async function fetchPrices(serverUrl) {
  try {
    const res = await fetch(`${serverUrl}/api/prices`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return;
    const data = await res.json();
    // Mapear { modelId: { in, out } } desde la respuesta del servidor
    const updated = {};
    for (const [id, p] of Object.entries(data)) {
      updated[id] = { in: p.in, out: p.out };
    }
    activeCosts = { ...DEFAULT_COSTS, ...updated };
    console.log('[Agent] Precios actualizados desde el servidor.');
  } catch {
    // Sin conexión o timeout → usar precios por defecto sin error visible
  }
}

function calcCost(modelId, inputTok, outputTok) {
  const p = activeCosts[modelId] || { in: 3.00, out: 15.00 };
  return (inputTok / 1e6) * p.in + (outputTok / 1e6) * p.out;
}

// ── Clasificación de tareas por palabras clave ────────────────────────────────
function classifyTask(text) {
  if (!text) return 'Código';
  const t = text.toLowerCase();
  if (/debug|error|bug|fix|falla|fallo|problema|no funciona|no compila|exception|crash/.test(t)) return 'Debug';
  if (/explica|qué es|que es|cómo|como |por qué|porqué|porque|describe|qué hace|que hace|qué significa/.test(t)) return 'Explicación';
  if (/revisa|review|verifica|mejora|optimiza|refactor|analiza|analiza|simplifica/.test(t)) return 'Revisión';
  if (/document|docs|readme|comentar|comenta| md |\.md|swagger|jsdoc/.test(t)) return 'Docs';
  return 'Código';
}

// ── Config ────────────────────────────────────────────────────────────────────
function loadConfig() {
  if (existsSync(CONFIG_FILE)) {
    const cfg = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    // Completar campos faltantes si el config fue creado por el instalador
    if (!cfg.token) cfg.token = randomUUID();
    if (!cfg.claudeDir) cfg.claudeDir = join(homedir(), '.claude');
    writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
    return cfg;
  }
  const config = {
    token:     randomUUID(),
    serverUrl: 'http://localhost:3001',
    claudeDir: join(homedir(), '.claude'),
  };
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(`[Agent] Config generada → ${CONFIG_FILE}`);
  console.log(`[Agent] Token: ${config.token}`);
  return config;
}

// ── Nombre legible del proyecto ───────────────────────────────────────────────
function decodeProjectName(folder) {
  return folder
    .replace(/^[A-Za-z]--/, '')
    .replace(/-/g, ' ')
    .trim() || folder;
}

// ── Búsqueda recursiva de .jsonl ──────────────────────────────────────────────
function findJsonlFiles(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st   = statSync(full);
      if (st.isDirectory()) results.push(...findJsonlFiles(full));
      else if (entry.endsWith('.jsonl')) results.push(full);
    }
  } catch {}
  return results;
}

// ── Extraer primera línea de texto de un mensaje ──────────────────────────────
function extractText(content) {
  if (typeof content === 'string') return content.slice(0, 300);
  if (Array.isArray(content)) {
    const t = content.find(c => c.type === 'text');
    return t ? (t.text || '').slice(0, 300) : '';
  }
  return '';
}

// ── Fecha de corte para sesiones ──────────────────────────────────────────────
function sessionCutoff() {
  const d = new Date();
  d.setDate(d.getDate() - SESSION_DAYS);
  return d.toISOString().slice(0, 10);
}

// ── Generación de stats + sesiones ────────────────────────────────────────────
function generateStats(claudeDir) {
  const projectsDir = join(claudeDir, 'projects');
  if (!existsSync(projectsDir)) return null;

  let folders;
  try { folders = readdirSync(projectsDir); } catch { return null; }

  const projects         = {};
  const globalHourCounts = {};
  const sessions         = [];
  const cutoff           = sessionCutoff();

  for (const folder of folders) {
    const folderPath = join(projectsDir, folder);
    try { if (!statSync(folderPath).isDirectory()) continue; } catch { continue; }

    const files = findJsonlFiles(folderPath);
    const proj  = {
      displayName:   decodeProjectName(folder),
      tokens:        { input: 0, output: 0 },
      costUSD:       0,
      requests:      0,
      modelUsage:    {},
      taskCounts:    {},
      dailyActivity: {},
      hourCounts:    {},
      lastWorked:    null,
    };

    for (const file of files) {
      let lines;
      try { lines = readFileSync(file, 'utf8').split('\n').filter(l => l.trim()); }
      catch { continue; }

      // ── Datos por archivo (= una sesión/conversación) ──────────────────────
      let sessFirstTs   = null;
      let sessInput     = 0;
      let sessOutput    = 0;
      let sessModel     = 'unknown';
      let sessUserMsg   = '';

      for (const line of lines) {
        let entry;
        try { entry = JSON.parse(line); } catch { continue; }

        // Primera línea del usuario → para clasificar la tarea
        if (entry.type === 'human' && !sessUserMsg) {
          sessUserMsg = extractText(entry.message?.content);
          if (!sessFirstTs && entry.timestamp) sessFirstTs = entry.timestamp;
        }

        if (entry.type !== 'assistant') continue;
        const usage = entry.message?.usage;
        if (!usage) continue;

        const model = entry.message?.model || 'unknown';
        const ts    = entry.timestamp;
        if (!ts) continue;

        if (!sessFirstTs) sessFirstTs = ts;
        sessModel  = model;

        const inTok  = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0);
        const outTok = (usage.output_tokens || 0);
        const date   = ts.slice(0, 10);
        const hour   = parseInt(ts.slice(11, 13), 10);
        const label  = labelModel(model);
        const cost   = calcCost(model, inTok, outTok);

        proj.tokens.output += outTok;
        proj.tokens.input  += inTok;
        proj.costUSD       += cost;
        proj.requests++;
        proj.modelUsage[label]   = (proj.modelUsage[label] || 0) + 1;
        proj.dailyActivity[date] = (proj.dailyActivity[date] || 0) + outTok;

        if (!isNaN(hour)) {
          proj.hourCounts[String(hour)]  = (proj.hourCounts[String(hour)]  || 0) + 1;
          globalHourCounts[String(hour)] = (globalHourCounts[String(hour)] || 0) + 1;
        }

        sessInput  += inTok;
        sessOutput += outTok;
      }

      // ── Acumular tarea en el proyecto ─────────────────────────────────────
      const sessTask = classifyTask(sessUserMsg);
      if (sessOutput > 0) {
        proj.taskCounts[sessTask] = (proj.taskCounts[sessTask] || 0) + 1;
      }

      // ── Guardar sesión si está dentro del período ──────────────────────────
      if (sessFirstTs && sessOutput > 0 && sessFirstTs.slice(0, 10) >= cutoff) {
        sessions.push({
          ts:          sessFirstTs,
          projectName: proj.displayName,
          task:        sessTask,
          model:       labelModel(sessModel),
          inputTokens: sessInput,
          outputTokens: sessOutput,
          costUSD:     calcCost(sessModel, sessInput, sessOutput),
        });
      }
    }

    // lastWorked = fecha más reciente con actividad
    const datesWithActivity = Object.keys(proj.dailyActivity).filter(d => proj.dailyActivity[d] > 0);
    proj.lastWorked = datesWithActivity.length > 0 ? datesWithActivity.sort().reverse()[0] : null;

    if (proj.requests > 0) projects[folder] = proj;
  }

  // Ordenar sesiones por fecha desc, limitar
  sessions.sort((a, b) => b.ts.localeCompare(a.ts));
  const recentSessions = sessions.slice(0, MAX_SESSIONS);

  return { projects, globalHourCounts, sessions: recentSessions };
}

// ── Upload ────────────────────────────────────────────────────────────────────
async function uploadStats(config, stats) {
  const payload = {
    token:       config.token,
    machineUser: process.env.USERNAME || process.env.USER || 'unknown',
    generatedAt: new Date().toISOString(),
    ...stats,
  };

  const res = await fetch(`${config.serverUrl}/api/upload`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Server ${res.status}`);
  return res.json();
}

// ── Main loop ─────────────────────────────────────────────────────────────────
async function tick(config) {
  try {
    await fetchPrices(config.serverUrl);
    console.log(`[${new Date().toISOString()}] Generando stats...`);
    const stats = generateStats(config.claudeDir);
    if (!stats || Object.keys(stats.projects).length === 0) {
      console.log('[Agent] Sin datos disponibles.');
      return;
    }
    await uploadStats(config, stats);
    console.log(`[Agent] OK — ${Object.keys(stats.projects).length} proyectos, ${stats.sessions.length} sesiones subidas.`);
  } catch (err) {
    console.error('[Agent] Error:', err.message);
  }
}

const config = loadConfig();
console.log(`[Agent] Iniciando — servidor: ${config.serverUrl}`);
tick(config);
setInterval(() => tick(config), INTERVAL_MS);
