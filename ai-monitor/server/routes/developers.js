import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, '../data/developers.json');

const DEFAULT_COLORS = ['#818cf8','#fbbf24','#38bdf8','#34d399','#f87171','#fb923c','#a78bfa','#f472b6'];

function readDevs() {
  try { return JSON.parse(readFileSync(FILE, 'utf8')); } catch { return []; }
}

function writeDevs(data) {
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function withStatus(devs) {
  return devs.map(d => ({
    ...d,
    dirOk: d.claudeDir ? existsSync(join(d.claudeDir, 'projects')) : false,
  }));
}

const router = Router();

router.get('/', (req, res) => {
  res.json(withStatus(readDevs()));
});

router.post('/', (req, res) => {
  const devs = readDevs();
  const { name, claudeDir, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });

  const usedColors = devs.map(d => d.color);
  const autoColor  = DEFAULT_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_COLORS[devs.length % DEFAULT_COLORS.length];

  devs.push({ name: name.trim(), claudeDir: (claudeDir || '').trim(), color: color || autoColor });
  writeDevs(devs);
  res.status(201).json(withStatus(devs));
});

router.put('/:index', (req, res) => {
  const i = parseInt(req.params.index, 10);
  const devs = readDevs();
  if (isNaN(i) || i < 0 || i >= devs.length) return res.status(404).json({ error: 'Desarrollador no encontrado' });

  const { name, claudeDir, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'El nombre es requerido' });

  devs[i] = { name: name.trim(), claudeDir: (claudeDir || '').trim(), color: color || devs[i].color };
  writeDevs(devs);
  res.json(withStatus(devs));
});

router.delete('/:index', (req, res) => {
  const i = parseInt(req.params.index, 10);
  const devs = readDevs();
  if (isNaN(i) || i < 0 || i >= devs.length) return res.status(404).json({ error: 'Desarrollador no encontrado' });

  devs.splice(i, 1);
  writeDevs(devs);
  res.json(withStatus(devs));
});

export default router;
export { readDevs };
