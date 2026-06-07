import { Router } from 'express';
import db from '../db/db.js';

const DEFAULT_CONFIG = {
  devs: ['Desarrollador 1', 'Desarrollador 2', 'Desarrollador 3'],
  team: 'Mi Equipo',
  model: 'Claude 3.5 Sonnet',
  palette: 'green',
  apiKeyMapping: {}
};

const router = Router();

function getConfig() {
  const rows = db.prepare('SELECT key, value FROM config').all();
  const stored = Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]));
  return { ...DEFAULT_CONFIG, ...stored };
}

router.get('/', (req, res) => {
  res.json(getConfig());
});

router.put('/', (req, res) => {
  const updates = req.body;
  const upsert = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
  const upsertMany = db.transaction(data => {
    for (const [k, v] of Object.entries(data)) upsert.run(k, JSON.stringify(v));
  });
  upsertMany(updates);
  res.json(getConfig());
});

export default router;
