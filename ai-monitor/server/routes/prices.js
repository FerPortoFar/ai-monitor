import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, '../data/prices.json');

const DEFAULTS = {
  'claude-sonnet-4-6':         { label: 'Sonnet 4.6', in: 3.00,  out: 15.00 },
  'claude-haiku-4-5-20251001': { label: 'Haiku 4.5',  in: 0.80,  out:  4.00 },
  'claude-opus-4-6':           { label: 'Opus 4.6',   in: 15.00, out: 75.00 },
  'claude-sonnet-4-20250514':  { label: 'Sonnet 3.7', in: 3.00,  out: 15.00 },
};

function read() {
  try { return JSON.parse(readFileSync(FILE, 'utf8')); } catch { return DEFAULTS; }
}
function save(data) {
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

const router = Router();

// GET público — el agente lo llama sin autenticación
router.get('/', (_req, res) => {
  res.json(read());
});

// PUT requiere sesión autenticada
router.put('/', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: 'No autenticado' });

  const current = read();
  const updates = req.body;

  // Solo actualizar modelos existentes (no permitir agregar modelos arbitrarios)
  for (const [modelId, prices] of Object.entries(updates)) {
    if (current[modelId]) {
      current[modelId].in  = parseFloat(prices.in)  || current[modelId].in;
      current[modelId].out = parseFloat(prices.out) || current[modelId].out;
      if (prices.label) current[modelId].label = prices.label;
    }
  }

  save(current);
  res.json(current);
});

export default router;
