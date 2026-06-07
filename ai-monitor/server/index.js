import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import usageRouter from './routes/usage.js';
import sessionsRouter from './routes/sessions.js';
import configRouter from './routes/config.js';
import developersRouter from './routes/developers.js';
import agentsRouter from './routes/agents.js';
import uploadRouter from './routes/upload.js';
import pricesRouter from './routes/prices.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = existsSync(join(__dirname, '../client/dist/index.html'));

// Asegurar que el directorio data/stats existe
const STATS_DIR = join(__dirname, 'data/stats');
if (!existsSync(STATS_DIR)) mkdirSync(STATS_DIR, { recursive: true });

app.use(cors({ origin: IS_PROD ? false : 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'aim-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Auth
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Campos requeridos' });

  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 2); // mes actual + 1, sin cero inicial
  const validPassword = `MIA${year}${month}`;

  if (username !== 'MonitorIA' || password !== validPassword) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  req.session.user = username;
  res.json({ ok: true, user: username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/usage', usageRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/config', configRouter);
app.use('/api/developers', developersRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/prices', pricesRouter);

if (IS_PROD) {
  app.use(express.static(join(__dirname, '../client/dist')));
  app.get('*', (_, res) => res.sendFile(join(__dirname, '../client/dist/index.html')));
}

app.listen(PORT, () => {
  console.log(`AI Monitor server → http://localhost:${PORT}`);
  console.log(`DEMO_MODE: ${process.env.DEMO_MODE}`);
});
