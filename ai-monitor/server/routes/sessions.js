import { Router } from 'express';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DEMO_SESSIONS, DEMO_HEATMAP } from '../data/demoData.js';
import { readAgents } from './agents.js';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const SESS_DIR   = join(__dirname, '../data/sessions');
const STATS_DIR  = join(__dirname, '../data/stats');

const router = Router();

function readSessionsFile(token) {
  const f = join(SESS_DIR, `${token}.json`);
  if (!existsSync(f)) return [];
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return []; }
}

function getAllRealSessions() {
  const agents = readAgents();
  if (agents.length === 0) return null;

  const all = [];
  for (let i = 0; i < agents.length; i++) {
    const sessions = readSessionsFile(agents[i].token);
    for (const s of sessions) {
      all.push({ ...s, devIndex: i });
    }
  }
  if (all.length === 0) return null;

  all.sort((a, b) => b.ts.localeCompare(a.ts));
  return all.slice(0, 300);
}

// Heatmap: 7 días × 24 horas calculado desde dailyActivity + hourCounts de cada agente
function buildHeatmap() {
  const agents = readAgents();
  if (agents.length === 0) return DEMO_HEATMAP;

  // Construir 7 días
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  // Acumular hourCounts por día desde todos los agentes (aproximación: misma distribución horaria para todos los días)
  const combinedHourCounts = {};
  let combinedDailyTotals = {};

  for (const agent of agents) {
    const f = join(STATS_DIR, `${agent.token}.json`);
    if (!existsSync(f)) continue;
    try {
      const stats = JSON.parse(readFileSync(f, 'utf8'));
      for (const proj of Object.values(stats.projects || {})) {
        for (const [h, v] of Object.entries(proj.hourCounts   || {})) combinedHourCounts[h]  = (combinedHourCounts[h] || 0) + v;
        for (const [d, v] of Object.entries(proj.dailyActivity|| {})) combinedDailyTotals[d] = (combinedDailyTotals[d] || 0) + v;
      }
    } catch {}
  }

  const totalHours = Object.values(combinedHourCounts).reduce((s, v) => s + v, 0) || 1;
  const hourDist   = Array.from({ length: 24 }, (_, h) => (combinedHourCounts[String(h)] || 0) / totalHours);

  return days.map(day => ({
    day,
    v: hourDist.map(p => Math.round((combinedDailyTotals[day] || 0) * p)),
  }));
}

router.get('/', (req, res) => {
  const real = getAllRealSessions();
  if (!real) return res.json(DEMO_SESSIONS);
  res.json(real);
});

router.get('/heatmap', (_req, res) => {
  res.json(buildHeatmap());
});

router.post('/', (req, res) => {
  // Endpoint legacy — ya no se usa activamente
  res.json({ ok: true });
});

export default router;
