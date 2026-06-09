import { Router } from 'express';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readAgents } from './agents.js';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const SESS_DIR   = join(__dirname, '../data/sessions');
const CACHE_FILE = join(__dirname, '../data/analysis-cache.json');
const CACHE_TTL  = 30 * 60 * 1000; // 30 min

const router = Router();

function readSessions(token) {
  const f = join(SESS_DIR, `${token}.json`);
  if (!existsSync(f)) return [];
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return []; }
}

// ── Métricas por dev ──────────────────────────────────────────────────────────
function computeMetrics(sessions, periodDays = 30) {
  const total = sessions.length;
  if (total === 0) return null;

  const activeDays        = new Set(sessions.map(s => s.ts.slice(0, 10))).size;
  const sessionsPerDay    = +(activeDays > 0 ? total / activeDays : 0).toFixed(2);
  const consistencyScore  = Math.min(100, Math.round((activeDays / periodDays) * 100));

  const totalOutput        = sessions.reduce((s, x) => s + (x.outputTokens || 0), 0);
  const totalInput         = sessions.reduce((s, x) => s + (x.inputTokens  || 0), 0);
  const avgOutputPerSession = Math.round(totalOutput / total);
  const totalCost          = +sessions.reduce((s, x) => s + (x.costUSD || 0), 0).toFixed(4);
  const costPerSession     = +(totalCost / total).toFixed(4);

  const debugSessions      = sessions.filter(s => s.task === 'Debug');
  const debugRatio         = Math.round((debugSessions.length / total) * 100);
  const avgDebugComplexity = debugSessions.length > 0
    ? Math.round(debugSessions.reduce((s, x) => s + (x.inputTokens || 0) + (x.outputTokens || 0), 0) / debugSessions.length)
    : 0;

  const taskCounts = {};
  for (const s of sessions) taskCounts[s.task] = (taskCounts[s.task] || 0) + 1;
  const taskTypes         = Object.keys(taskCounts).length;
  const taskDiversityScore = Math.round((taskTypes / 5) * 100);
  const topTask           = Object.entries(taskCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Código';
  const projects          = new Set(sessions.filter(s => s.projectName).map(s => s.projectName)).size;

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
    totalOutput, totalInput, avgOutputPerSession, totalCost, costPerSession,
    debugRatio, avgDebugComplexity, taskDiversityScore, taskTypes,
    taskCounts, topTask, projects,
    productivityScore, problemSolvingScore,
  };
}

// ── Generación de texto a partir de métricas ──────────────────────────────────
function profileType(m) {
  if (m.productivityScore >= 70 && m.problemSolvingScore >= 70) return 'alto rendimiento';
  if (m.productivityScore >= 70) return 'alto volumen';
  if (m.problemSolvingScore >= 70) return 'resolución de problemas';
  if (m.consistencyScore < 40) return 'uso irregular';
  return 'en desarrollo';
}

function generateDevAnalysis(name, m, allMetrics) {
  const isTopProducer  = allMetrics.every(x => x.name === name || m.totalOutput >= x.metrics.totalOutput);
  const isTopConsistent = allMetrics.every(x => x.name === name || m.consistencyScore >= x.metrics.consistencyScore);
  const isTopDebugger  = allMetrics.every(x => x.name === name || m.avgDebugComplexity >= x.metrics.avgDebugComplexity);
  const avgCostTeam    = allMetrics.reduce((s, x) => s + x.metrics.costPerSession, 0) / allMetrics.length;
  const isEfficient    = m.costPerSession < avgCostTeam * 0.85;
  const isExpensive    = m.costPerSession > avgCostTeam * 1.2;
  const profile        = profileType(m);

  // Párrafo de análisis
  let analysis = `${name} muestra un perfil de ${profile}. `;

  if (m.sessionsPerDay >= 5) {
    analysis += `Con ${m.sessionsPerDay} sesiones por día, es uno de los usuarios más activos. `;
  } else if (m.sessionsPerDay < 2) {
    analysis += `El promedio de ${m.sessionsPerDay} sesiones por día indica uso esporádico con margen de crecimiento. `;
  }

  if (m.debugRatio > 40) {
    analysis += `El ${m.debugRatio}% de sus sesiones son de debug, lo que sugiere que afronta problemas de alta complejidad o que el ciclo implementación-error necesita atención. `;
  } else if (m.debugRatio < 15) {
    analysis += `Bajo ratio de debug (${m.debugRatio}%), lo que puede indicar implementación limpia o poco uso para resolución de errores. `;
  }

  if (isEfficient) {
    analysis += `Su costo por sesión ($${m.costPerSession.toFixed(3)}) es el más bajo del equipo, señal de prompts bien estructurados.`;
  } else if (isExpensive) {
    analysis += `Costo por sesión ($${m.costPerSession.toFixed(3)}) por encima del promedio — revisar si los contextos enviados son demasiado extensos.`;
  }

  // Fortalezas
  const strengths = [];
  if (isTopProducer)   strengths.push('Mayor volumen de output generado del equipo');
  if (isTopConsistent) strengths.push(`Consistencia diaria destacada (${m.consistencyScore}%)`);
  if (isTopDebugger)   strengths.push('Mayor profundidad en sesiones de resolución de bugs');
  if (m.taskTypes >= 4) strengths.push(`Alta diversidad de tareas (${m.taskTypes} tipos)`);
  if (isEfficient)     strengths.push('Mejor costo/valor del equipo');
  if (m.projects >= 3) strengths.push(`Trabajo en ${m.projects} proyectos distintos`);
  if (strengths.length === 0) strengths.push('Uso equilibrado entre tipos de tarea');

  // Áreas de mejora
  const weaknesses = [];
  if (m.consistencyScore < 40)  weaknesses.push(`Baja consistencia diaria — solo activo ${m.activeDays} días del período`);
  if (m.taskDiversityScore < 40) weaknesses.push('Uso concentrado en pocos tipos de tarea');
  if (m.debugRatio > 45)        weaknesses.push('Alto ratio de debug puede indicar ciclos de error evitables');
  if (isExpensive)              weaknesses.push('Costo por sesión elevado vs el promedio del equipo');
  if (m.avgOutputPerSession < 500) weaknesses.push('Sesiones cortas: podría aprovechar más cada interacción');
  if (weaknesses.length === 0)  weaknesses.push('Sin áreas críticas identificadas en este período');

  // Recomendación
  let recommendation = '';
  if (m.consistencyScore < 40) {
    recommendation = `Establecer mínimo 3 sesiones de IA por día hábil. La consistencia es el factor que más impacta el score: con ${m.activeDays} días activos de ${30} posibles, hay mucho margen de mejora.`;
  } else if (m.debugRatio > 45) {
    recommendation = `Usar IA para revisión de código ANTES de implementar, no solo para debug. Reducir el ratio de debug del ${m.debugRatio}% al 25% liberaría tiempo valioso.`;
  } else if (m.taskDiversityScore < 40) {
    recommendation = `Incorporar la IA en más fases del trabajo: documentación, revisión de código de pares, y planificación técnica. Actualmente solo usa ${m.taskTypes} de 5 tipos posibles.`;
  } else if (isExpensive) {
    recommendation = `Reducir el tamaño del contexto enviado en cada sesión. Prompts más focalizados bajan el costo y mejoran la calidad de respuesta.`;
  } else {
    recommendation = `Mantener el ritmo actual y compartir con el equipo los prompts más efectivos. Su perfil de ${profile} lo posiciona como referente en el uso de IA.`;
  }

  return { analysis, strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 2), recommendation };
}

function generateTeamAnalysis(devMetrics) {
  const sorted    = [...devMetrics].sort((a, b) => b.metrics.productivityScore - a.metrics.productivityScore);
  const leader    = sorted[0];
  const avgConsistency = Math.round(devMetrics.reduce((s, d) => s + d.metrics.consistencyScore, 0) / devMetrics.length);
  const totalSessions  = devMetrics.reduce((s, d) => s + d.metrics.total, 0);
  const totalCost      = devMetrics.reduce((s, d) => s + d.metrics.totalCost, 0).toFixed(2);
  const avgDebug       = Math.round(devMetrics.reduce((s, d) => s + d.metrics.debugRatio, 0) / devMetrics.length);
  const scores         = devMetrics.map(d => (d.metrics.productivityScore + d.metrics.problemSolvingScore) / 2);
  const gap            = Math.round(Math.max(...scores) - Math.min(...scores));

  let summary = `El equipo registró ${totalSessions} sesiones con un costo total de $${totalCost}. `;
  summary += `${leader.name} lidera en productividad con ${leader.metrics.sessionsPerDay} sesiones/día y una consistencia del ${leader.metrics.consistencyScore}%. `;
  if (gap > 25) {
    summary += `Existe una brecha de ${gap} puntos entre el dev de mayor y menor score, lo que indica adopción desigual que conviene nivelar. `;
  } else {
    summary += `Los scores del equipo son relativamente homogéneos (brecha de ${gap} puntos), señal de adopción pareja. `;
  }
  summary += `La consistencia promedio del equipo es del ${avgConsistency}% y el ratio de debug promedio del ${avgDebug}%.`;

  const strengths = [];
  if (avgConsistency >= 60) strengths.push('Uso consistente de IA en la rutina diaria del equipo');
  if (totalSessions > 100)  strengths.push('Alto volumen de interacciones — la IA es parte del flujo de trabajo');
  const topTask = devMetrics.flatMap(d => Object.entries(d.metrics.taskCounts))
    .reduce((acc, [t, v]) => { acc[t] = (acc[t] || 0) + v; return acc; }, {});
  const mainTask = Object.entries(topTask).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (mainTask) strengths.push(`La tarea más frecuente del equipo es "${mainTask}"`);
  if (strengths.length < 2) strengths.push('Diversidad de proyectos trabajados con IA');

  const recommendations = [];
  if (gap > 25) recommendations.push(`Nivelar la brecha: que ${leader.name} comparta su metodología con el resto del equipo`);
  if (avgDebug > 35) recommendations.push('Implementar revisión de código con IA antes de cada PR para reducir bugs en producción');
  recommendations.push('Medir quincenalmente si las sesiones de IA se traducen en commits reales o features entregadas');
  if (avgConsistency < 50) recommendations.push('Establecer ritual diario de uso de IA — aunque sea una consulta corta — para construir el hábito');

  return { summary, strengths, recommendations: recommendations.slice(0, 3) };
}

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO = {
  isDemo: true,
  team: {
    summary: 'El equipo registró 20 sesiones demo con un costo total de $10.47. Dev 1 lidera en productividad con 3.2 sesiones/día y una consistencia del 72%. La brecha entre el dev de mayor y menor score es de 28 puntos, lo que indica adopción desigual. La tarea más frecuente es Código.',
    strengths: ['Diversidad de tipos de tarea en todo el equipo', 'Dev 1 muestra consistencia destacada en uso diario', 'Uso de modelos adecuados según complejidad de tarea'],
    recommendations: ['Que Dev 1 comparta su metodología con Dev 3 para reducir la brecha', 'Implementar revisión de código con IA antes de cada PR', 'Medir si las sesiones se traducen en commits y features entregadas'],
  },
  developers: [
    { name: 'Dev 1', color: '#818cf8', productivityScore: 78, problemSolvingScore: 62, total: 8, activeDays: 6, sessionsPerDay: 3.2, consistencyScore: 72, totalCost: 4.51, costPerSession: 0.56, debugRatio: 25, avgDebugComplexity: 4200, taskDiversityScore: 80, topTask: 'Código', projects: 4, analysis: 'Dev 1 muestra un perfil de alto volumen. Con 3.2 sesiones por día es el usuario más activo. El 25% de sus sesiones son de debug, señal de implementación con errores resolubles. Su costo por sesión está dentro del promedio del equipo.', strengths: ['Mayor volumen de output del equipo', 'Consistencia diaria destacada (72%)'], weaknesses: ['Ratio de revisión de código bajo — implementa sin revisar'], recommendation: 'Destinar el 20% de sesiones a revisión de código propio antes de hacer commit para reducir el ciclo de debug.' },
    { name: 'Dev 2', color: '#fbbf24', productivityScore: 64, problemSolvingScore: 82, total: 7, activeDays: 5, sessionsPerDay: 2.4, consistencyScore: 58, totalCost: 5.44, costPerSession: 0.77, debugRatio: 43, avgDebugComplexity: 7800, topTask: 'Debug', taskDiversityScore: 100, projects: 3, analysis: 'Dev 2 muestra un perfil de resolución de problemas. Sus sesiones de debug son las más largas y complejas del equipo. Alta diversidad de tipos de tarea. Costo por sesión por encima del promedio — revisar si los contextos enviados son demasiado extensos.', strengths: ['Mayor profundidad en resolución de bugs', 'Alta diversidad de tareas (5 tipos)'], weaknesses: ['Costo por sesión elevado vs el promedio del equipo'], recommendation: 'Reducir el tamaño del contexto enviado. Prompts más focalizados bajan el costo y mejoran la calidad de respuesta.' },
    { name: 'Dev 3', color: '#38bdf8', productivityScore: 50, problemSolvingScore: 65, total: 5, activeDays: 3, sessionsPerDay: 1.8, consistencyScore: 38, totalCost: 0.52, costPerSession: 0.10, debugRatio: 20, avgDebugComplexity: 2100, taskDiversityScore: 60, topTask: 'Explicación', projects: 2, analysis: 'Dev 3 muestra un perfil en desarrollo. El promedio de 1.8 sesiones por día indica uso esporádico con margen de crecimiento. Solo activo 3 de los 30 días del período. Su costo por sesión es el más bajo del equipo, señal de prompts bien estructurados.', strengths: ['Mejor costo/valor del equipo', 'Bajo ratio de debug (20%)'], weaknesses: ['Baja consistencia diaria — solo activo 3 días del período', 'Uso concentrado en pocos proyectos'], recommendation: 'Establecer mínimo 3 sesiones de IA por día hábil. La consistencia es el factor que más impacta el score: con 3 días activos de 30 posibles, hay mucho margen de mejora.' },
  ],
};

// ── Endpoint ──────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const agents = readAgents();
  if (agents.length === 0) {
    return res.json({ ...DEMO, generatedAt: new Date().toISOString() });
  }

  // Cache válido
  if (!req.query.force && existsSync(CACHE_FILE)) {
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
    return res.json({ ...DEMO, generatedAt: new Date().toISOString() });
  }

  // Generar análisis desde los datos
  const team = generateTeamAnalysis(devMetrics);
  const developers = devMetrics.map(d => {
    const { analysis, strengths, weaknesses, recommendation } = generateDevAnalysis(d.name, d.metrics, devMetrics);
    return {
      name:               d.name,
      color:              d.color,
      productivityScore:  d.metrics.productivityScore,
      problemSolvingScore: d.metrics.problemSolvingScore,
      analysis, strengths, weaknesses, recommendation,
      ...d.metrics,
    };
  });

  const result = { generatedAt: new Date().toISOString(), isDemo: false, team, developers };

  try { writeFileSync(CACHE_FILE, JSON.stringify(result, null, 2)); } catch {}
  res.json(result);
});

// Forzar regeneración: GET /api/analysis?force=1 ya lo maneja arriba

export default router;
