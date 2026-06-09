import { Router } from 'express';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readAgents } from './agents.js';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const STATS_DIR  = join(__dirname, '../data/stats');
const SESS_DIR   = join(__dirname, '../data/sessions');
const CACHE_FILE = join(__dirname, '../data/analysis-cache.json');
const CACHE_TTL  = 30 * 60 * 1000; // 30 min

const router = Router();

function readSessions(token) {
  const f = join(SESS_DIR, `${token}.json`);
  if (!existsSync(f)) return [];
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return []; }
}

// ── Cálculo de métricas por dev ───────────────────────────────────────────────
function computeMetrics(sessions, periodDays = 30) {
  const total = sessions.length;
  if (total === 0) return null;

  const activeDays       = new Set(sessions.map(s => s.ts.slice(0, 10))).size;
  const sessionsPerDay   = +(activeDays > 0 ? total / activeDays : 0).toFixed(2);
  const consistencyScore = Math.min(100, Math.round((activeDays / periodDays) * 100));

  const totalOutput        = sessions.reduce((s, x) => s + (x.outputTokens || 0), 0);
  const totalInput         = sessions.reduce((s, x) => s + (x.inputTokens  || 0), 0);
  const avgOutputPerSession = Math.round(totalOutput / total);
  const totalCost          = +sessions.reduce((s, x) => s + (x.costUSD || 0), 0).toFixed(4);

  const debugSessions      = sessions.filter(s => s.task === 'Debug');
  const debugRatio         = Math.round((debugSessions.length / total) * 100);
  const avgDebugComplexity = debugSessions.length > 0
    ? Math.round(debugSessions.reduce((s, x) => s + (x.inputTokens || 0) + (x.outputTokens || 0), 0) / debugSessions.length)
    : 0;

  const taskCounts = {};
  for (const s of sessions) taskCounts[s.task] = (taskCounts[s.task] || 0) + 1;
  const taskTypes        = Object.keys(taskCounts).length;
  const taskDiversityScore = Math.round((taskTypes / 5) * 100);
  const topTask          = Object.entries(taskCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Código';
  const projects         = new Set(sessions.filter(s => s.projectName).map(s => s.projectName)).size;

  // Scores compuestos 0-100
  const productivityScore = Math.min(100, Math.round(
    (Math.min(sessionsPerDay / 8, 1) * 40) +
    (consistencyScore * 0.35) +
    (Math.min(avgOutputPerSession / 4000, 1) * 25)
  ));
  const problemSolvingScore = Math.min(100, Math.round(
    (taskDiversityScore * 0.35) +
    (Math.min(avgDebugComplexity / 8000, 1) * 100 * 0.35) +
    (Math.min(debugRatio / 35, 1) * 100 * 0.30)
  ));

  return {
    total, activeDays, sessionsPerDay, consistencyScore,
    totalOutput, totalInput, avgOutputPerSession, totalCost,
    debugRatio, avgDebugComplexity, taskDiversityScore, taskTypes,
    taskCounts, topTask, projects,
    productivityScore, problemSolvingScore,
  };
}

// ── Llamada a Claude API ──────────────────────────────────────────────────────
async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch { return null; }
}

function buildPrompt(devMetrics) {
  const devsText = devMetrics.map(d => `
Desarrollador: ${d.name}
- Sesiones totales: ${d.metrics.total} | Días activos: ${d.metrics.activeDays}
- Sesiones/día: ${d.metrics.sessionsPerDay} | Consistencia: ${d.metrics.consistencyScore}%
- Output promedio/sesión: ${d.metrics.avgOutputPerSession} tokens
- Costo total: $${d.metrics.totalCost}
- % sesiones Debug: ${d.metrics.debugRatio}% | Complejidad debug: ${d.metrics.avgDebugComplexity} tokens
- Diversidad de tareas: ${d.metrics.taskTypes} tipos (${d.metrics.taskDiversityScore}%)
- Proyectos distintos: ${d.metrics.projects} | Tarea principal: ${d.metrics.topTask}
- Desglose: ${JSON.stringify(d.metrics.taskCounts)}
- Score productividad: ${d.metrics.productivityScore}/100
- Score resolución: ${d.metrics.problemSolvingScore}/100`).join('\n');

  return `Eres un analista senior de productividad y adopción de IA en equipos de desarrollo de software. Analiza los datos de uso de Claude Code de este equipo y entrega un diagnóstico en español, directo y accionable. No uses frases genéricas.

DATOS:
${devsText}

Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "team": {
    "summary": "3-4 oraciones. Diagnóstico real del equipo: quién lidera, patrones destacados, brechas entre miembros.",
    "strengths": ["fortaleza concreta 1", "fortaleza concreta 2", "fortaleza concreta 3"],
    "recommendations": ["acción específica 1", "acción específica 2", "acción específica 3"]
  },
  "developers": [
    {
      "name": "nombre exacto del dev",
      "analysis": "2-3 oraciones. Perfil específico: qué hace bien, qué patrón de uso tiene, qué lo diferencia del resto.",
      "strengths": ["fortaleza 1", "fortaleza 2"],
      "weaknesses": ["área de mejora 1", "área de mejora 2"],
      "recommendation": "Una acción concreta y medible para este dev en los próximos 30 días."
    }
  ]
}`;
}

// ── Análisis demo (sin datos reales) ─────────────────────────────────────────
const DEMO_ANALYSIS = {
  isDemo: true,
  team: {
    summary: 'El equipo muestra adopción activa de IA con perfiles complementarios. Dev 1 lidera en volumen y constancia, Dev 2 destaca en resolución de problemas complejos, y Dev 3 tiene el mayor potencial de crecimiento. La brecha más notable está en la consistencia diaria entre miembros.',
    strengths: ['Alta diversidad de tipos de tarea en el equipo', 'Uso de modelos especializados según complejidad', 'Constancia sostenida en días hábiles'],
    recommendations: ['Establecer ritual de 15 min diarios de revisión con IA para todo el equipo', 'Compartir semanalmente los prompts más efectivos en un canal interno', 'Vincular sesiones de IA con tickets de Jira para medir impacto real en entregables'],
  },
  developers: [
    {
      name: 'Dev 1',
      productivityScore: 78,
      problemSolvingScore: 62,
      analysis: 'Perfil de alto volumen con enfoque en implementación. Es el miembro más constante del equipo y el que mayor cantidad de código genera por sesión. Sin embargo, el bajo ratio de revisión sugiere que implementa rápido pero revisa poco, lo que puede generar deuda técnica.',
      strengths: ['Mayor volumen de output del equipo', 'Constancia diaria destacada'],
      weaknesses: ['Bajo ratio de sesiones de revisión de código', 'Concentración en pocos tipos de tarea'],
      recommendation: 'Durante las próximas 4 semanas, destinar el 20% de las sesiones de IA a revisión de código propio antes de hacer commit.',
    },
    {
      name: 'Dev 2',
      productivityScore: 64,
      problemSolvingScore: 84,
      analysis: 'Perfil orientado a resolver problemas difíciles. Sus sesiones de debug son las más largas y complejas del equipo, lo que indica que afronta issues de alto nivel. La frecuencia diaria es menor pero la profundidad por sesión es superior al promedio.',
      strengths: ['Mayor capacidad de resolución de problemas complejos', 'Alta diversidad de tipos de tarea'],
      weaknesses: ['Frecuencia diaria de uso por debajo del equipo', 'Costo por sesión más elevado'],
      recommendation: 'Incorporar sesiones cortas (< 5 min) para tareas menores, apuntando a al menos 6 sesiones diarias para mantener el contexto activo.',
    },
    {
      name: 'Dev 3',
      productivityScore: 52,
      problemSolvingScore: 68,
      analysis: 'Perfil en desarrollo con buena base técnica. Usa la IA de forma equilibrada entre explicaciones y código, lo que sugiere un proceso activo de aprendizaje. La inconsistencia en días sin actividad es el principal factor que limita su score.',
      strengths: ['Buen ratio costo/output', 'Diversidad de proyectos trabajados'],
      weaknesses: ['Baja consistencia diaria (días sin actividad)', 'Menor volumen total de sesiones'],
      recommendation: 'Fijar al menos 3 sesiones de IA por día hábil como objetivo mínimo, aunque sean consultas simples, para construir el hábito y el contexto acumulado.',
    },
  ],
};

// ── Endpoint ──────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const agents = readAgents();
  if (agents.length === 0) {
    return res.json({ ...DEMO_ANALYSIS, generatedAt: new Date().toISOString() });
  }

  // Cache válido → devolver directo
  if (existsSync(CACHE_FILE)) {
    try {
      const cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
      if (Date.now() - new Date(cache.generatedAt).getTime() < CACHE_TTL) {
        return res.json(cache);
      }
    } catch {}
  }

  // Calcular métricas
  const devMetrics = [];
  for (const agent of agents) {
    const sessions = readSessions(agent.token);
    const metrics  = computeMetrics(sessions);
    if (metrics) devMetrics.push({ name: agent.alias, color: agent.color, metrics });
  }

  if (devMetrics.length === 0) {
    return res.json({ ...DEMO_ANALYSIS, generatedAt: new Date().toISOString() });
  }

  // Llamar a Claude
  let aiResult = null;
  try { aiResult = await callClaude(buildPrompt(devMetrics)); } catch {}

  const result = {
    generatedAt: new Date().toISOString(),
    isDemo: false,
    devMetrics: devMetrics.map(d => ({ name: d.name, color: d.color, ...d.metrics })),
    team: aiResult?.team || {
      summary: 'Análisis generado con datos reales. Configura ANTHROPIC_API_KEY para obtener análisis detallado.',
      strengths: [],
      recommendations: [],
    },
    developers: (aiResult?.developers || devMetrics.map(d => ({
      name: d.name,
      analysis: 'Configura ANTHROPIC_API_KEY en el servidor para obtener análisis detallado.',
      strengths: [],
      weaknesses: [],
      recommendation: '',
    }))).map((d, i) => ({
      ...d,
      color: devMetrics[i]?.color || '#818cf8',
      productivityScore:    devMetrics[i]?.metrics.productivityScore    ?? 0,
      problemSolvingScore:  devMetrics[i]?.metrics.problemSolvingScore  ?? 0,
    })),
  };

  try { writeFileSync(CACHE_FILE, JSON.stringify(result, null, 2)); } catch {}
  res.json(result);
});

// Forzar regeneración
router.delete('/cache', (_req, res) => {
  try { if (existsSync(CACHE_FILE)) { const { unlinkSync } = require('fs'); unlinkSync(CACHE_FILE); } } catch {}
  res.json({ ok: true });
});

export default router;
