import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const AGENTS_FILE = join(__dirname, '../data/agents.json');
const STATS_DIR   = join(__dirname, '../data/stats');
const SESS_DIR    = join(__dirname, '../data/sessions');

const DEFAULT_COLORS = ['#818cf8','#fbbf24','#38bdf8','#34d399','#f87171','#fb923c','#a78bfa','#f472b6'];

function readAgents() {
  try { return JSON.parse(readFileSync(AGENTS_FILE, 'utf8')); } catch { return []; }
}
function writeAgents(data) {
  writeFileSync(AGENTS_FILE, JSON.stringify(data, null, 2));
}

const router = Router();

router.post('/', (req, res) => {
  const { token, machineUser, generatedAt, projects, globalHourCounts } = req.body;
  if (!token) return res.status(400).json({ error: 'token requerido' });

  if (!existsSync(STATS_DIR)) mkdirSync(STATS_DIR, { recursive: true });
  if (!existsSync(SESS_DIR))  mkdirSync(SESS_DIR,  { recursive: true });

  const { sessions, ...statsBody } = req.body;

  // Guardar stats del agente
  writeFileSync(
    join(STATS_DIR, `${token}.json`),
    JSON.stringify({ token, machineUser, generatedAt, projects: projects || {}, globalHourCounts: globalHourCounts || {} }, null, 2)
  );

  // Guardar sesiones del agente
  if (Array.isArray(sessions) && sessions.length > 0) {
    writeFileSync(
      join(SESS_DIR, `${token}.json`),
      JSON.stringify(sessions, null, 2)
    );
  }

  // Auto-registrar en agents.json si es la primera vez
  const agents = readAgents();
  if (!agents.find(a => a.token === token)) {
    const usedColors = agents.map(a => a.color);
    const color = DEFAULT_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_COLORS[agents.length % DEFAULT_COLORS.length];
    agents.push({ token, alias: machineUser || token.slice(0, 8), color });
    writeAgents(agents);
    console.log(`[Upload] Nuevo agente registrado: ${machineUser || token.slice(0, 8)} (${token.slice(0, 8)}...)`);
  }

  const proj = Object.keys(projects || {}).length;
  console.log(`[Upload] Stats recibidas — ${machineUser} — ${proj} proyectos`);
  res.json({ ok: true });
});

export default router;
