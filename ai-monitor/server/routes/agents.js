import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_FILE = join(__dirname, '../data/agents.json');
const STATS_DIR   = join(__dirname, '../data/stats');

export function readAgents() {
  try { return JSON.parse(readFileSync(AGENTS_FILE, 'utf8')); } catch { return []; }
}
function writeAgents(data) {
  writeFileSync(AGENTS_FILE, JSON.stringify(data, null, 2));
}

function readStats(token) {
  const f = join(STATS_DIR, `${token}.json`);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

function withStats(agents) {
  return agents.map(a => {
    const s = readStats(a.token);
    return {
      ...a,
      machineUser: s?.machineUser ?? null,
      lastSeen:    s?.generatedAt ?? null,
      hasData:     s !== null,
    };
  });
}

const router = Router();

router.get('/', (_req, res) => {
  res.json(withStats(readAgents()));
});

router.put('/:token', (req, res) => {
  const agents = readAgents();
  const idx = agents.findIndex(a => a.token === req.params.token);
  if (idx === -1) return res.status(404).json({ error: 'Agente no encontrado' });

  const { alias, color } = req.body;
  if (!alias?.trim()) return res.status(400).json({ error: 'El alias es requerido' });

  agents[idx] = { ...agents[idx], alias: alias.trim(), color: color || agents[idx].color };
  writeAgents(agents);
  res.json(withStats(agents));
});

router.delete('/:token', (req, res) => {
  const agents = readAgents();
  const idx = agents.findIndex(a => a.token === req.params.token);
  if (idx === -1) return res.status(404).json({ error: 'Agente no encontrado' });

  agents.splice(idx, 1);
  writeAgents(agents);

  const statsFile = join(STATS_DIR, `${req.params.token}.json`);
  if (existsSync(statsFile)) try { unlinkSync(statsFile); } catch {}

  res.json(withStats(agents));
});

export default router;
