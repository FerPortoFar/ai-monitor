# PROMPT PARA CLAUDE CODE — AI Monitor Dashboard

> Pegar este prompt completo al iniciar Claude Code en el directorio del proyecto.

---

## Contexto del proyecto

Necesito convertir un prototipo HTML completo en una aplicación web funcional con
backend real conectado a la Anthropic Admin API. El prototipo ya existe y tiene alta
fidelidad visual — el objetivo es **reproducirlo fielmente** en producción y reemplazar
los datos demo por datos reales de la API.

El archivo `AI_Monitor.html` está adjunto y es la referencia visual autoritativa.
No rediseñes nada — implementá exactamente lo que ves ahí.

---

## Stack tecnológico

**Backend:** Node.js + Express
**Frontend:** React + TypeScript + Vite
**Gráficos:** Chart.js 4.4.x (igual que el prototipo — no cambiar a Recharts)
**Estilos:** CSS puro con CSS Custom Properties (igual que el prototipo — NO Tailwind)
**Fuentes:** Space Grotesk + JetBrains Mono (Google Fonts, igual que el prototipo)
**DB local:** SQLite (via `better-sqlite3`) para persistir sesiones y clasificación de tareas
**Auth admin:** Variable de entorno, nunca expuesta al cliente

---

## Estructura de carpetas a crear

```
ai-monitor/
├── server/
│   ├── index.js              ← Express server principal
│   ├── routes/
│   │   ├── usage.js          ← GET /api/usage?period=today|week|month
│   │   ├── sessions.js       ← GET /api/sessions, POST /api/sessions
│   │   └── config.js         ← GET/PUT /api/config
│   ├── services/
│   │   ├── anthropicAdmin.js ← Wrapper de la Anthropic Admin API
│   │   └── classifier.js     ← Clasificador de tipo de tarea
│   ├── db/
│   │   ├── schema.sql        ← Esquema SQLite
│   │   └── db.js             ← Conexión y helpers
│   └── middleware/
│       └── auth.js           ← Validación de sesión simple
├── client/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── styles/
│   │   │   └── globals.css   ← COPIAR exactamente el CSS del prototipo
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Topbar.tsx
│   │   │   ├── overview/
│   │   │   │   ├── KPIGrid.tsx
│   │   │   │   ├── DeveloperCard.tsx
│   │   │   │   └── Charts.tsx
│   │   │   ├── developers/
│   │   │   │   ├── DevTabs.tsx
│   │   │   │   └── DevDetail.tsx
│   │   │   ├── activity/
│   │   │   │   ├── HeatMap.tsx
│   │   │   │   └── SessionsLog.tsx
│   │   │   └── shared/
│   │   │       └── SettingsModal.tsx
│   │   ├── hooks/
│   │   │   ├── useConfig.ts      ← localStorage config
│   │   │   └── useDashboard.ts   ← fetch + polling de datos
│   │   └── types/
│   │       └── dashboard.ts      ← Interfaces TypeScript
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
├── .env.example
├── package.json          ← workspace raíz
└── README.md
```

---

## Diseño visual — reglas estrictas

El CSS del prototipo usa CSS Custom Properties. Copiarlas **exactamente**:

```css
:root {
  --a: #22c55e; --ah: #4ade80; --ab: rgba(34,197,94,.08); --abr: rgba(34,197,94,.22);
  --bg0: #060c14; --bg1: #0c1522; --bg2: #121e30; --bg3: #1a2840;
  --t1: #eef4ff; --t2: #7d95b0; --t3: #3d5268;
  --br: rgba(255,255,255,.05); --r: 12px; --rs: 8px;
  --ff: 'Space Grotesk', sans-serif; --fm: 'JetBrains Mono', monospace;
}
/* Paletas por data-pal en body */
body[data-pal=indigo] { --a:#6366f1; --ah:#818cf8; --ab:rgba(99,102,241,.08); --abr:rgba(99,102,241,.22) }
body[data-pal=blue]   { --a:#38bdf8; --ah:#7dd3fc; --ab:rgba(56,189,248,.08); --abr:rgba(56,189,248,.22) }
body[data-pal=amber]  { --a:#f59e0b; --ah:#fcd34d; --ab:rgba(245,158,11,.08); --abr:rgba(245,158,11,.22) }
body[data-pal=rose]   { --a:#f43f5e; --ah:#fb7185; --ab:rgba(244,63,94,.08);  --abr:rgba(244,63,94,.22) }
```

Colores fijos por desarrollador (independientes de la paleta):
- Dev 1: `#818cf8`
- Dev 2: `#fbbf24`
- Dev 3: `#38bdf8`

---

## Backend — Anthropic Admin API

### Variables de entorno requeridas (.env)

```env
ANTHROPIC_ADMIN_KEY=sk-ant-admin-...   # Admin key (distinta a la key de usuario)
ANTHROPIC_ORG_ID=                      # ID de la organización (si aplica)
SESSION_SECRET=                        # Secret para cookies de sesión
PORT=3001
DEMO_MODE=true                         # Si es true, usa datos demo del prototipo
```

### Endpoints de Anthropic a consumir

```
GET https://api.anthropic.com/v1/organizations/usage_report/messages
  Headers: anthropic-version: 2023-06-01, x-api-key: $ADMIN_KEY
  Params:  starting_at, ending_at, bucket_width (1m|1h|1d), group_by (workspace_id|api_key_id)

GET https://api.anthropic.com/v1/organizations/cost_report
  Params:  starting_at, ending_at, bucket_width, group_by (workspace_id|description)

GET https://api.anthropic.com/v1/organizations/rate_limits
  (sin params extra)
```

### Lógica de períodos

```javascript
// server/services/anthropicAdmin.js
function getPeriodRange(period) {
  const now = new Date();
  const endings = { today: 'PT1H', week: 'P1D', month: 'P1D' };
  switch(period) {
    case 'today': return {
      starting_at: new Date(now.setHours(0,0,0,0)).toISOString(),
      ending_at: new Date().toISOString(),
      bucket_width: '1h'
    };
    case 'week': return {
      starting_at: new Date(now - 7*86400000).toISOString(),
      ending_at: new Date().toISOString(),
      bucket_width: '1d'
    };
    case 'month': return {
      starting_at: new Date(now - 30*86400000).toISOString(),
      ending_at: new Date().toISOString(),
      bucket_width: '1d'
    };
  }
}
```

### Shape de respuesta del backend hacia el cliente

El cliente espera exactamente esta interfaz (TypeScript):

```typescript
// client/src/types/dashboard.ts

export interface PeriodData {
  labels: string[];           // ej: ['00h','01h',...] o ['Lun','Mar',...]
  developers: DevData[];      // array de 3, índices 0|1|2
}

export interface DevData {
  tokens: { input: number; output: number };
  requests: number;
  costUSD: number;
  tasks: Record<string, number>;       // { Código: 52, Debug: 38, ... }
  activity: number[];                  // una entrada por label
  modelUsage: Record<string, number>;  // { 'claude-sonnet-4-5': 89, ... }
}

export interface Session {
  ts: string;          // 'HH:MM'
  devIndex: number;    // 0|1|2
  task: string;        // 'Código'|'Debug'|'Explicación'|'Revisión'|'Docs'
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
}

export interface DashboardConfig {
  devs: [string, string, string];
  team: string;
  model: string;
  palette: 'green' | 'indigo' | 'blue' | 'amber' | 'rose';
  apiKeyMapping: {            // mapea api_key_id → índice de dev 0|1|2
    [apiKeyId: string]: number;
  };
}
```

---

## Clasificación de tipo de tarea

La Anthropic Admin API **no distingue** el tipo de solicitud. Implementar capa propia:

### Opción A — metadata en el request (recomendada si controlás el cliente)

Cuando tus apps llaman a la API de Anthropic, agregar en el body:
```json
{ "metadata": { "user_id": "dev1", "task_type": "Código" } }
```
El cost_report agrupado por `description` incluirá este tag. El backend parsea el campo
`description` de cada bucket para inferir el task_type.

### Opción B — clasificación por NLP (fallback automático)

Si no podés controlar los clientes, usar el texto de la sesión para clasificar:

```javascript
// server/services/classifier.js
const PATTERNS = {
  'Código':      [/\bcodigo\b/i, /\bfunction\b/i, /\bimplementa\b/i, /\bscript\b/i, /```/],
  'Debug':       [/\berror\b/i, /\bbug\b/i, /\bfalla\b/i, /\bexception\b/i, /\btraceback\b/i],
  'Revisión':    [/\brevis[aá]\b/i, /\breview\b/i, /\brefactor\b/i, /\bmejora\b/i],
  'Explicación': [/\bexplica\b/i, /\bqu[eé] es\b/i, /\bc[oó]mo funciona\b/i, /\benti[eé]ndo\b/i],
  'Docs':        [/\bdocumenta\b/i, /\breadme\b/i, /\bcomenta\b/i, /\bdocstring\b/i],
};

export function classifyTask(promptText) {
  for (const [task, patterns] of Object.entries(PATTERNS)) {
    if (patterns.some(p => p.test(promptText))) return task;
  }
  return 'Código'; // default
}
```

### Tabla SQLite para sesiones propias

```sql
-- server/db/schema.sql
CREATE TABLE IF NOT EXISTS sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT    NOT NULL,        -- ISO timestamp
  dev_index   INTEGER NOT NULL,        -- 0|1|2
  api_key_id  TEXT,
  task_type   TEXT    NOT NULL DEFAULT 'Código',
  model       TEXT    NOT NULL,
  input_toks  INTEGER NOT NULL DEFAULT 0,
  output_toks INTEGER NOT NULL DEFAULT 0,
  cost_usd    REAL    NOT NULL DEFAULT 0,
  raw_meta    TEXT                     -- JSON del metadata original
);

CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## API REST del backend propio

```
GET  /api/usage?period=today|week|month
     → PeriodData (de Admin API si DEMO_MODE=false, demo si true)

GET  /api/sessions?period=today|week|month&devIndex=0|1|2
     → Session[]

POST /api/sessions
     body: Session
     → { id: number }

GET  /api/config
     → DashboardConfig

PUT  /api/config
     body: Partial<DashboardConfig>
     → DashboardConfig

GET  /api/rate-limits
     → { model: string, rpm: number, itpm: number, otpm: number }[]

GET  /api/health
     → { ok: true, demo: boolean, adminApiConnected: boolean }
```

---

## Pantallas a implementar (fidelidad exacta al prototipo)

### 1. Login
- Grid de fondo con líneas `rgba(255,255,255,0.018)` cada 48px
- Glow central radial-gradient
- Card 420px, animación `fadeUp` 0.4s
- Validación: usuario + pass no vacíos → accede. "Modo demo →" → sin validación
- Enter en cualquier input dispara login

### 2. Overview (pantalla principal)
- Sidebar 58px fijo izquierdo con iconos SVG
- Topbar sticky con título, period tabs (Hoy/Semana/Mes) y palette dots (5 colores)
- KPI grid 4 columnas: Total Tokens | Costo Estimado | Total Requests | Más Activo
- Developer cards grid 3 columnas con: avatar iniciales, ranking badge (oro/plata/bronce),
  barra de tokens input/output, stats 2×2, sparkline SVG generada dinámicamente
- Chart row 1: Line chart actividad (3 datasets) + Doughnut tipos de tarea (cutout 70%)
- Chart row 2: Stacked bar input/output + Horizontal bar modelos utilizados

### 3. Desarrolladores
- Tabs con avatar + nombre (3 devs)
- KPI grid 5 columnas al cambiar de tab
- Donut tareas + bar modelos (row)
- Line chart actividad individual (150px)
- Tabla de sesiones con tags de tarea coloreados

### 4. Actividad
- Line chart actividad por hora (datos de hoy, 3 devs)
- Doughnut participación por dev
- **Heatmap**: CSS Grid puro, 7 filas × 24 celdas, 18px alto, color acento con
  opacidad proporcional: `opacity = 0.12 + (v/max) * 0.83`
- Log de sesiones: tabla con dot de color por dev + tag de tarea

### 5. Modal de Configuración
- Nombres de 3 devs con preview de iniciales
- Nombre del equipo
- Modelo principal
- Paleta de color (5 opciones visuales)
- Mapeo API key → dev (nuevo, no estaba en el prototipo)

---

## Comportamiento del polling / refresh

```typescript
// client/src/hooks/useDashboard.ts
// Polling cada 60 segundos en modo real, sin polling en modo demo
const POLL_INTERVAL = 60_000;
```

---

## DEMO_MODE

Cuando `DEMO_MODE=true` en el .env, el backend devuelve exactamente los datos
hardcodeados del prototipo original (copiarlos del HTML adjunto). Esto permite
usar el dashboard sin Admin API key durante desarrollo.

Los datos demo están en el HTML adjunto bajo la variable `const DATA = { today: {...}, week: {...}, month: {...} }`.
Copiá esa estructura exacta al backend como `server/data/demoData.js`.

---

## Preguntas antes de empezar

**Antes de escribir código, confirmame:**

1. ¿Cuántos developers monitoreás actualmente? (El prototipo soporta 3 fijos, ¿necesitás N dinámico?)
2. ¿Tenés Admin API key de Anthropic? (Team o Enterprise plan). Si no, arrancamos en DEMO_MODE=true.
3. ¿Los developers usan Claude Code, claude.ai, o tu propia integración via API?
   Esto determina si la clasificación de tareas es posible via metadata o necesita NLP.
4. ¿Dónde se despliega? (localhost, servidor propio, Vercel, etc.)

---

## Notas importantes

- **El Admin API key NUNCA va al cliente.** Todas las llamadas a Anthropic van desde Express.
- El CSS del prototipo usa variables CSS en `:root` + `body[data-pal=X]`. Mantener
  exactamente ese patrón — no convertir a Tailwind ni CSS Modules.
- Los gráficos se instancian con `new Chart()` igual que en el prototipo. En React,
  usar `useEffect` + `useRef` para el canvas. Destruir con `chartInstance.destroy()`
  en el cleanup del useEffect.
- La sparkline de las developer cards es SVG inline generado desde los datos de actividad.
  El algoritmo de generación está en el prototipo: normalizar valores a rango [0,26],
  luego `M x,y L x,y ...` + area fill con opacidad 0.08.
- El heatmap usa CSS Grid puro, sin librerías. 24 columnas, celdas de 18px.
- La configuración persiste en localStorage bajo la clave `'aim-cfg'` (compatibilidad
  con el prototipo) Y también en `/api/config` para sincronización entre sesiones.

---

*Archivo generado como referencia para Claude Code. El HTML completo del prototipo
está en `AI_Monitor.html` en la raíz del proyecto.*
