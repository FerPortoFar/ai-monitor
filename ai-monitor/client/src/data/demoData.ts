import type { PeriodData, Session, HeatmapRow, Developer, DevTrend, MonthHistory } from '../types/dashboard';

export const DEMO_DEVS: Developer[] = [
  { name: 'Ana García',       color: '#818cf8', hasData: true, dirOk: true },
  { name: 'Carlos López',     color: '#fbbf24', hasData: true, dirOk: true },
  { name: 'Martín Silva',     color: '#38bdf8', hasData: true, dirOk: true },
  { name: 'Laura Fernández',  color: '#34d399', hasData: true, dirOk: true },
  { name: 'Diego Romero',     color: '#f87171', hasData: true, dirOk: true },
  { name: 'Sofía Martínez',   color: '#fb923c', hasData: true, dirOk: true },
];

const DEMO_TRENDS_TODAY: DevTrend[] = [
  { tokensDelta: 8.2,   costDelta: 8.2   },
  { tokensDelta: -12.4, costDelta: -12.4 },
  { tokensDelta: 22.6,  costDelta: 22.6  },
  { tokensDelta: 5.1,   costDelta: 5.1   },
  { tokensDelta: -3.8,  costDelta: -3.8  },
  { tokensDelta: 17.3,  costDelta: 17.3  },
];
const DEMO_TRENDS_WEEK: DevTrend[] = [
  { tokensDelta: 14.2,  costDelta: 14.2  },
  { tokensDelta: -6.8,  costDelta: -6.8  },
  { tokensDelta: 9.4,   costDelta: 9.4   },
  { tokensDelta: 11.2,  costDelta: 11.2  },
  { tokensDelta: -2.5,  costDelta: -2.5  },
  { tokensDelta: 6.8,   costDelta: 6.8   },
];
const DEMO_TRENDS_MONTH: DevTrend[] = [
  { tokensDelta: 21.5,  costDelta: 21.5  },
  { tokensDelta: 3.2,   costDelta: 3.2   },
  { tokensDelta: -4.1,  costDelta: -4.1  },
  { tokensDelta: 8.7,   costDelta: 8.7   },
  { tokensDelta: -1.9,  costDelta: -1.9  },
  { tokensDelta: 13.4,  costDelta: 13.4  },
];

export const DEMO_PERIODS: Record<string, PeriodData> = {
  today: {
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`),
    developers: [
      { tokens: { input: 38400, output: 12800 }, requests: 24, costUSD: 2.18, tasks: { Código: 10, Debug: 7, Explicación: 4, Revisión: 2, Docs: 1 }, activity: [0,0,0,0,0,1,3,8,12,15,13,11,9,12,14,11,9,6,4,2,1,0,0,0], modelUsage: { 'Sonnet 4.6': 12, 'Haiku 4.5': 8,  'Opus 4.6': 4 }, projects: {} },
      { tokens: { input: 19200, output: 6800  }, requests: 13, costUSD: 1.14, tasks: { Código: 5,  Debug: 3, Explicación: 3, Revisión: 1, Docs: 1 }, activity: [0,0,0,0,0,0,1,4,8,7,6,5,5,7,8,7,5,4,2,1,0,0,0,0],   modelUsage: { 'Sonnet 4.6': 6,  'Haiku 4.5': 5,  'Opus 4.6': 2 }, projects: {} },
      { tokens: { input: 9800,  output: 3200  }, requests: 7,  costUSD: 0.58, tasks: { Código: 3,  Debug: 2, Explicación: 1, Revisión: 1, Docs: 0 }, activity: [0,0,0,0,0,0,0,2,4,5,4,3,3,4,5,4,3,2,1,0,0,0,0,0],   modelUsage: { 'Sonnet 4.6': 3,  'Haiku 4.5': 3,  'Opus 4.6': 1 }, projects: {} },
      { tokens: { input: 14600, output: 5100  }, requests: 11, costUSD: 0.96, tasks: { Código: 4,  Debug: 2, Explicación: 3, Revisión: 1, Docs: 1 }, activity: [0,0,0,0,0,0,2,5,7,8,7,6,5,7,8,7,5,3,2,1,0,0,0,0],   modelUsage: { 'Sonnet 4.6': 5,  'Haiku 4.5': 4,  'Opus 4.6': 2 }, projects: {} },
      { tokens: { input: 7200,  output: 2400  }, requests: 6,  costUSD: 0.43, tasks: { Código: 2,  Debug: 2, Explicación: 1, Revisión: 1, Docs: 0 }, activity: [0,0,0,0,0,0,0,1,3,4,3,2,2,3,4,3,2,1,0,0,0,0,0,0],   modelUsage: { 'Sonnet 4.6': 3,  'Haiku 4.5': 2,  'Opus 4.6': 1 }, projects: {} },
      { tokens: { input: 22100, output: 7600  }, requests: 16, costUSD: 1.48, tasks: { Código: 6,  Debug: 3, Explicación: 4, Revisión: 2, Docs: 1 }, activity: [0,0,0,0,0,1,2,6,9,10,9,8,6,9,10,9,7,5,3,1,0,0,0,0],  modelUsage: { 'Sonnet 4.6': 8,  'Haiku 4.5': 6,  'Opus 4.6': 2 }, projects: {} },
    ],
    configuredIndices: [0, 1, 2, 3, 4, 5],
    devTrends: DEMO_TRENDS_TODAY,
  },
  week: {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    developers: [
      { tokens: { input: 284500, output: 97200  }, requests: 167, costUSD: 15.82, tasks: { Código: 52, Debug: 38, Explicación: 28, Revisión: 22, Docs: 27 }, activity: [45000,62000,38000,71000,55000,48000,62700], modelUsage: { 'Sonnet 4.6': 89, 'Haiku 4.5': 64, 'Opus 4.6': 14 }, projects: {} },
      { tokens: { input: 142000, output: 51300  }, requests: 89,  costUSD: 8.34,  tasks: { Código: 31, Debug: 18, Explicación: 22, Revisión: 9,  Docs: 9  }, activity: [22000,28000,19000,35000,31000,28000,30300], modelUsage: { 'Sonnet 4.6': 42, 'Haiku 4.5': 38, 'Opus 4.6': 9  }, projects: {} },
      { tokens: { input: 67800,  output: 23400  }, requests: 45,  costUSD: 3.98,  tasks: { Código: 18, Debug: 8,  Explicación: 12, Revisión: 4,  Docs: 3  }, activity: [8000,12000,9000,14000,13000,12000,13200],  modelUsage: { 'Sonnet 4.6': 22, 'Haiku 4.5': 17, 'Opus 4.6': 6  }, projects: {} },
      { tokens: { input: 98400,  output: 34200  }, requests: 62,  costUSD: 5.82,  tasks: { Código: 22, Debug: 12, Explicación: 16, Revisión: 7,  Docs: 5  }, activity: [14000,18000,13000,22000,19000,17000,18200], modelUsage: { 'Sonnet 4.6': 30, 'Haiku 4.5': 24, 'Opus 4.6': 8  }, projects: {} },
      { tokens: { input: 48200,  output: 16800  }, requests: 31,  costUSD: 2.76,  tasks: { Código: 12, Debug: 8,  Explicación: 7,  Revisión: 3,  Docs: 1  }, activity: [6000,9000,7000,11000,9000,8000,9800],    modelUsage: { 'Sonnet 4.6': 15, 'Haiku 4.5': 12, 'Opus 4.6': 4  }, projects: {} },
      { tokens: { input: 164000, output: 57400  }, requests: 108, costUSD: 11.24, tasks: { Código: 38, Debug: 22, Explicación: 24, Revisión: 14, Docs: 10 }, activity: [28000,36000,24000,42000,35000,31000,36600], modelUsage: { 'Sonnet 4.6': 54, 'Haiku 4.5': 42, 'Opus 4.6': 12 }, projects: {} },
    ],
    configuredIndices: [0, 1, 2, 3, 4, 5],
    devTrends: DEMO_TRENDS_WEEK,
  },
  month: {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    developers: [
      { tokens: { input: 1240000, output: 428000 }, requests: 714, costUSD: 68.42, tasks: { Código: 218, Debug: 162, Explicación: 124, Revisión: 98,  Docs: 112 }, activity: [285000,312000,298000,345000], modelUsage: { 'Sonnet 4.6': 384, 'Haiku 4.5': 274, 'Opus 4.6': 56 }, projects: {} },
      { tokens: { input: 621000,  output: 224000 }, requests: 382, costUSD: 36.18, tasks: { Código: 132, Debug: 78,  Explicación: 94,  Revisión: 42,  Docs: 36  }, activity: [142000,158000,172000,149000], modelUsage: { 'Sonnet 4.6': 182, 'Haiku 4.5': 162, 'Opus 4.6': 38 }, projects: {} },
      { tokens: { input: 298000,  output: 102000 }, requests: 194, costUSD: 17.14, tasks: { Código: 76,  Debug: 34,  Explicación: 52,  Revisión: 18,  Docs: 14  }, activity: [88000,78000,96000,68000],    modelUsage: { 'Sonnet 4.6': 96,  'Haiku 4.5': 74,  'Opus 4.6': 24 }, projects: {} },
      { tokens: { input: 418000,  output: 146000 }, requests: 268, costUSD: 24.82, tasks: { Código: 94,  Debug: 52,  Explicación: 68,  Revisión: 30,  Docs: 24  }, activity: [96000,108000,112000,104000], modelUsage: { 'Sonnet 4.6': 132, 'Haiku 4.5': 102, 'Opus 4.6': 34 }, projects: {} },
      { tokens: { input: 204000,  output: 71400  }, requests: 132, costUSD: 12.18, tasks: { Código: 48,  Debug: 32,  Explicación: 28,  Revisión: 14,  Docs: 10  }, activity: [46000,52000,58000,48000],    modelUsage: { 'Sonnet 4.6': 64,  'Haiku 4.5': 52,  'Opus 4.6': 16 }, projects: {} },
      { tokens: { input: 694000,  output: 244000 }, requests: 442, costUSD: 48.24, tasks: { Código: 158, Debug: 94,  Explicación: 108, Revisión: 52,  Docs: 30  }, activity: [162000,178000,188000,166000], modelUsage: { 'Sonnet 4.6': 224, 'Haiku 4.5': 178, 'Opus 4.6': 40 }, projects: {} },
    ],
    configuredIndices: [0, 1, 2, 3, 4, 5],
    devTrends: DEMO_TRENDS_MONTH,
  },
};

export const DEMO_SESSIONS: Session[] = [
  { ts: '17:42', devIndex: 0, task: 'Código',     model: 'Sonnet 4.6', inputTokens: 3240,  outputTokens: 1120,  costUSD: 0.22, source: 'claude-code', projectName: 'API Gateway',        prompt: 'Implementa un endpoint REST para gestionar usuarios con validación de JWT y manejo de errores' },
  { ts: '17:28', devIndex: 1, task: 'Debug',       model: 'Haiku 4.5', inputTokens: 1840,  outputTokens: 560,   costUSD: 0.06, source: 'claude-code', projectName: 'Checkout Service',   prompt: 'Error en la función de pago: TypeError: cannot read properties of undefined reading map' },
  { ts: '17:15', devIndex: 0, task: 'Revisión',    model: 'Sonnet 4.6', inputTokens: 2100,  outputTokens: 840,   costUSD: 0.16, source: 'claude-code', projectName: 'Dashboard UI',       prompt: 'Revisa este componente React y sugiere mejoras de rendimiento y accesibilidad' },
  { ts: '16:58', devIndex: 2, task: 'Explicación', model: 'Sonnet 4.6', inputTokens: 4200,  outputTokens: 1680,  costUSD: 0.32, source: 'claude-code', projectName: 'Backend Core',       prompt: 'Explica cómo funciona el garbage collector en Node.js y cuándo puede causar memory leaks' },
  { ts: '16:44', devIndex: 0, task: 'Código',      model: 'Sonnet 4.6', inputTokens: 5600,  outputTokens: 1900,  costUSD: 0.42, source: 'claude-code', projectName: 'Dashboard UI',       prompt: 'Crea un hook de React para manejar formularios con validación y estado de carga' },
  { ts: '16:32', devIndex: 1, task: 'Docs',        model: 'Haiku 4.5', inputTokens: 920,   outputTokens: 380,   costUSD: 0.03, source: 'claude-code', projectName: 'API Gateway',        prompt: 'Documenta la API de autenticación con ejemplos de uso en curl y JavaScript' },
  { ts: '16:18', devIndex: 2, task: 'Debug',       model: 'Opus 4.6',  inputTokens: 1560,  outputTokens: 480,   costUSD: 0.08, source: 'claude-code', projectName: 'Reportes',           prompt: 'El query SQL tarda 30 segundos en producción, analiza el plan de ejecución y propón índices' },
  { ts: '16:05', devIndex: 0, task: 'Código',      model: 'Sonnet 4.6', inputTokens: 7840,  outputTokens: 2640,  costUSD: 0.58, source: 'claude-code', projectName: 'Notificaciones',     prompt: 'Implementa websockets para notificaciones en tiempo real con reconexión automática' },
  { ts: '15:52', devIndex: 1, task: 'Explicación', model: 'Sonnet 4.6', inputTokens: 3120,  outputTokens: 1040,  costUSD: 0.24, source: 'claude-code', projectName: 'Dashboard UI',       prompt: 'Qué diferencia hay entre useEffect y useLayoutEffect y cuándo usar cada uno' },
  { ts: '15:38', devIndex: 0, task: 'Debug',       model: 'Haiku 4.5', inputTokens: 2200,  outputTokens: 720,   costUSD: 0.08, source: 'claude-code', projectName: 'CI Pipeline',        prompt: 'La pipeline de CI falla en el paso de tests con ECONNREFUSED, adjunto logs completos' },
  { ts: '15:24', devIndex: 2, task: 'Código',      model: 'Sonnet 4.6', inputTokens: 4800,  outputTokens: 1560,  costUSD: 0.36, source: 'claude-code', projectName: 'Backend Core',       prompt: 'Genera un sistema de caché en Redis con TTL configurable y fallback a base de datos' },
  { ts: '15:10', devIndex: 1, task: 'Revisión',    model: 'Sonnet 4.6', inputTokens: 1840,  outputTokens: 620,   costUSD: 0.14, source: 'claude-code', projectName: 'Checkout Service',   prompt: 'Optimiza esta función de ordenamiento, actualmente es O(n²) y procesa 50k registros' },
  { ts: '14:55', devIndex: 0, task: 'Código',      model: 'Opus 4.6',  inputTokens: 38600, outputTokens: 12400,  costUSD: 2.18, source: 'claude-code', projectName: 'Facturación',        prompt: 'Refactoriza el módulo de facturación completo a TypeScript con tipos estrictos' },
  { ts: '14:42', devIndex: 2, task: 'Docs',        model: 'Haiku 4.5', inputTokens: 1100,  outputTokens: 440,   costUSD: 0.04, source: 'claude-code', projectName: 'Backend Core',       prompt: 'Escribe el README del proyecto con instrucciones de instalación, uso y contribución' },
  { ts: '14:28', devIndex: 0, task: 'Explicación', model: 'Sonnet 4.6', inputTokens: 2800,  outputTokens: 940,   costUSD: 0.20, source: 'claude-code', projectName: 'API Gateway',        prompt: 'Cómo funciona el patrón Repository y cuándo vale la pena usarlo vs acceso directo a ORM' },
  { ts: '14:15', devIndex: 1, task: 'Código',      model: 'Sonnet 4.6', inputTokens: 62000, outputTokens: 21000, costUSD: 5.01, source: 'claude-code', projectName: 'Auth Service',       prompt: 'Implementa autenticación OAuth2 completa con Google, refresh tokens y revocación' },
  { ts: '14:02', devIndex: 2, task: 'Debug',       model: 'Haiku 4.5', inputTokens: 1680,  outputTokens: 520,   costUSD: 0.05, source: 'claude-code', projectName: 'Backend Core',       prompt: 'El proceso de Node.js consume 2GB de RAM con el tiempo, necesito encontrar el leak' },
  { ts: '13:48', devIndex: 0, task: 'Código',      model: 'Sonnet 4.6', inputTokens: 8900,  outputTokens: 3100,  costUSD: 0.72, source: 'claude-code', projectName: 'Jobs Worker',        prompt: 'Crea un sistema de jobs en cola con Bull y Redis, con reintentos y dead-letter queue' },
  { ts: '13:35', devIndex: 1, task: 'Explicación', model: 'Haiku 4.5', inputTokens: 2400,  outputTokens: 820,   costUSD: 0.07, source: 'claude-code', projectName: 'Formación Interna',  prompt: 'Explica SOLID con ejemplos prácticos en TypeScript, especialmente el principio de inversión de dependencias' },
  { ts: '13:22', devIndex: 0, task: 'Revisión',    model: 'Sonnet 4.6', inputTokens: 3100,  outputTokens: 1040,  costUSD: 0.23, source: 'claude-code', projectName: 'Auth Service',       prompt: 'Analiza la seguridad de esta implementación de login: posibles vulnerabilidades y fixes' },
  { ts: '13:10', devIndex: 3, task: 'Código',      model: 'Sonnet 4.6', inputTokens: 4200,  outputTokens: 1480,  costUSD: 0.28, source: 'claude-code', projectName: 'Mobile App',         prompt: 'Implementa la pantalla de perfil de usuario en React Native con edición de foto' },
  { ts: '12:58', devIndex: 4, task: 'Debug',       model: 'Haiku 4.5',  inputTokens: 1620,  outputTokens: 490,   costUSD: 0.05, source: 'claude-code', projectName: 'ETL Pipeline',       prompt: 'El proceso de ETL falla silenciosamente en el paso de transformación de fechas' },
  { ts: '12:44', devIndex: 5, task: 'Código',      model: 'Sonnet 4.6', inputTokens: 5800,  outputTokens: 2100,  costUSD: 0.48, source: 'claude-code', projectName: 'E-commerce',         prompt: 'Crea el módulo de descuentos con reglas combinables por categoría, usuario y cupón' },
  { ts: '12:30', devIndex: 3, task: 'Explicación', model: 'Sonnet 4.6', inputTokens: 3400,  outputTokens: 1180,  costUSD: 0.22, source: 'claude-code', projectName: 'Mobile App',         prompt: 'Explica la diferencia entre useState y useReducer y cuándo conviene cada uno' },
  { ts: '12:18', devIndex: 5, task: 'Revisión',    model: 'Sonnet 4.6', inputTokens: 2600,  outputTokens: 880,   costUSD: 0.17, source: 'claude-code', projectName: 'E-commerce',         prompt: 'Revisa este módulo de carrito de compras y detecta posibles race conditions' },
  { ts: '12:05', devIndex: 4, task: 'Código',      model: 'Haiku 4.5',  inputTokens: 1980,  outputTokens: 620,   costUSD: 0.07, source: 'claude-code', projectName: 'Data Warehouse',     prompt: 'Genera los scripts SQL para particionar la tabla de eventos por mes automáticamente' },
  { ts: '11:52', devIndex: 3, task: 'Debug',       model: 'Sonnet 4.6', inputTokens: 2800,  outputTokens: 940,   costUSD: 0.18, source: 'claude-code', projectName: 'Mobile App',         prompt: 'La app crashea al rotar la pantalla cuando el modal de cámara está abierto' },
  { ts: '11:38', devIndex: 5, task: 'Docs',        model: 'Haiku 4.5',  inputTokens: 1100,  outputTokens: 420,   costUSD: 0.03, source: 'claude-code', projectName: 'E-commerce',         prompt: 'Documenta la arquitectura del módulo de pagos con diagramas de flujo en Mermaid' },
  { ts: '11:24', devIndex: 4, task: 'Explicación', model: 'Sonnet 4.6', inputTokens: 3900,  outputTokens: 1340,  costUSD: 0.26, source: 'claude-code', projectName: 'ETL Pipeline',       prompt: 'Cómo funciona Apache Airflow internamente y cómo gestiona las dependencias entre DAGs' },
];

export const DEMO_HEATMAP: HeatmapRow[] = [
  { day: 'Lun', v: [0,0,0,0,0,0,0,2,5,8,9,7,6,8,9,8,6,4,2,1,0,0,0,0] },
  { day: 'Mar', v: [0,0,0,0,0,0,1,4,9,11,10,8,7,9,11,9,7,5,3,1,0,0,0,0] },
  { day: 'Mié', v: [0,0,0,0,0,0,0,3,6,7,8,6,5,7,8,7,5,3,2,0,0,0,0,0] },
  { day: 'Jue', v: [0,0,0,0,0,0,1,5,10,13,12,9,8,10,12,10,8,6,4,2,0,0,0,0] },
  { day: 'Vie', v: [0,0,0,0,0,0,0,4,8,10,9,7,6,8,9,8,6,4,2,1,0,0,0,0] },
  { day: 'Sáb', v: [0,0,0,0,0,0,0,1,3,5,4,3,2,3,4,3,2,1,0,0,0,0,0,0] },
  { day: 'Dom', v: [0,0,0,0,0,0,0,0,1,2,2,1,1,2,2,1,1,0,0,0,0,0,0,0] },
];

export const DEMO_HISTORY: MonthHistory = {
  months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  devCosts: [
    [45.2, 52.1, 48.3, 61.4, 58.2, 68.4],
    [22.1, 28.4, 25.2, 31.8, 30.1, 36.2],
    [11.8, 14.2, 12.9, 16.4, 15.8, 17.1],
  ],
};
