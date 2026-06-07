# Handoff: AI Monitor — Dashboard de Agentes IA

## Overview
AI Monitor es un panel de administración (dashboard) para monitorear el consumo de tokens, costo estimado, requests y tipos de tareas que realizan tres desarrolladores al usar agentes de IA (principalmente Claude, pero configurable). Permite evaluar si el equipo está usando la IA y para qué la usan.

## Sobre los archivos de diseño
Los archivos incluidos en este bundle son **prototipos de referencia creados en HTML puro** — no son código de producción para copiar directamente. La tarea del desarrollador es **recrear estos diseños en el entorno del codebase real** (React, Next.js, Vue, etc.) usando sus patrones, librerías de componentes y sistema de diseño existentes. Si no hay entorno previo, se recomienda **React + TypeScript + Tailwind CSS + Recharts** como stack natural para este tipo de dashboard.

## Fidelidad
**Alta fidelidad (hifi)**: Los prototipos son pixel-perfect con colores, tipografía, espaciado e interacciones finales. El desarrollador debe recrear la UI lo más fielmente posible usando las librerías del codebase.

---

## Pantallas / Vistas

### 1. Login Screen

**Propósito**: Autenticación del usuario antes de acceder al dashboard.

**Layout**:
- Viewport completo, fondo `#060c14`
- Grid de fondo: líneas de 1px `rgba(255,255,255,0.018)` cada 48px (horizontal y vertical)
- Glow central: radial-gradient circular de 900px con el color de acento al 8% de opacidad
- Card centrada: 420px de ancho, `border-radius: 12px`, fondo `#0c1522`
- Borde superior: 1px sólido con el color de acento al 22% de opacidad
- Padding: 48px vertical, 40px horizontal
- Box-shadow: `0 40px 100px rgba(0,0,0,0.6)`
- Animación de entrada: `fadeUp` (opacidad 0→1, translateY 16px→0, 0.4s ease)

**Componentes**:
- **Logo**: ícono SVG (nodo neuronal) 44×44px + texto "AI Monitor" (18px, 700, tracking -0.4px) + subtítulo (11px, color `#7d95b0`)
- **Heading**: "Bienvenido" — 22px, font-weight 600
- **Subheading**: "Inicia sesión para acceder al panel de tu equipo" — 13px, `#7d95b0`
- **Input Usuario**: label uppercase 10px/600 + input full-width, fondo `#121e30`, border 1px `rgba(255,255,255,0.05)`, padding 11px 14px, `border-radius: 8px`. Focus: border → color de acento
- **Input Contraseña**: mismo estilo, type="password"
- **Botón "Entrar al panel"**: full-width, `background: var(--accent)`, color negro, 12px padding, font-weight 600, border-radius 8px. Hover: opacity 0.88
- **Link "Modo demo →"**: texto 12px `#7d95b0`, enlace en color de acento. Entra sin validación real

**Comportamiento**:
- Cualquier usuario + contraseña no vacíos → accede al dashboard (modo demo)
- "Modo demo →" → accede directamente con usuario "Demo"
- Enter en cualquier campo → dispara login
- Error visible si campos vacíos

---

### 2. Dashboard — Overview (pantalla principal)

**Layout**:
- Sidebar fijo izquierdo: 58px de ancho, fondo `#0c1522`, border-right `rgba(255,255,255,0.05)`
- Main area: `margin-left: 58px`, altura 100vh, overflow-y: auto
- Topbar sticky: 12px 24px padding, backdrop-filter blur 12px, fondo `rgba(6,12,20,0.94)`
- Content: padding 20px 24px

**Topbar**:
- Título h2 (15px/600) + subtítulo p (11px, `#7d95b0`)
- Period tabs: "Hoy / Semana / Mes" — pill activo con fondo accent, fondo inactivo transparente. Fondo del tab group: `#0c1522`, border 1px, border-radius 8px, padding 3px
- Palette dots: 5 círculos de 15px, cada uno en su color de acento. Activo con border-color blanco. Hover: scale(1.25)

**Sidebar**:
- Logo: 36×36px cuadrado redondeado con color de acento
- Nav icons: 40×40px botones. Activo/hover: fondo `var(--accent-bg)`, color accent
- Bottom: ícono settings + avatar de usuario (32×32 circular)

**Sección KPIs** (grid 4 columnas, gap 12px):
Cada card: fondo `#0c1522`, border 1px, border-radius 12px, padding 16px 18px
- Línea top 1px: gradient del color de acento → transparente (50% width), opacity 0.6
- Label: 10px uppercase, tracking 0.7px, `#7d95b0`
- Value: JetBrains Mono 24px/600, color `#eef4ff`
- Sub: 11px `#3d5268`
- Ícono decorativo: absolute right 14px, opacity 0.12

Cards: **Total Tokens** | **Costo Estimado** | **Total Requests** | **Más Activo**

**Sección Developer Cards** (grid 3 columnas, gap 12px):
Cada card: fondo `#0c1522`, border, border-radius 12px, padding 18px. Hover: border → accent, box-shadow

- **Header**: avatar 40×40px (`border-radius: 10px`, color dev en fondo al 9%) + nombre (14px/600) + subtítulo (11px, `#7d95b0`) + badge de ranking (#1 dorado, #2 plata, #3 bronce)
- **Token bar**: labels 10px JetBrains Mono "↑ Xk in / ↓ Xk out" + barra 5px altura con dos segmentos: input (100% opacidad del color dev) y output (30% opacidad)
- **Stats grid** (2×2): Tokens total (color dev) | Costo | Tarea top | Requests
- **Sparkline**: SVG 28px alto, `preserveAspectRatio="none"`, path con area fill + stroke del color dev

**Colores de cada developer** (fijos, independientes de la paleta UI):
- Dev 1: `#818cf8` (indigo-400)
- Dev 2: `#fbbf24` (amber-400)
- Dev 3: `#38bdf8` (sky-400)

**Sección Charts Row 1** (grid `1.8fr 1fr`, gap 12px):
- **Actividad en el tiempo** (line chart): 3 datasets, una línea por dev, fill suave. Eje Y con formato K/M. Tooltip modo "index". Sin leyenda en chart, leyenda custom encima.
- **Tipos de tarea** (doughnut, cutout 70%): 5 categorías (Código, Debug, Explicación, Revisión, Docs) con colores `['#818cf8','#fbbf24','#38bdf8','#34d399','#f87171']`. Leyenda a la derecha.

**Sección Charts Row 2** (grid `1fr 1fr`, gap 12px):
- **Input vs Output** (stacked bar): 3 barras (una por dev), stack de input (opaco) + output (30%). Color por dev.
- **Modelos utilizados** (horizontal bar): 3 modelos, colores `['#818cf8cc','#fbbf24cc','#38bdf8cc']`

---

### 3. Pantalla Desarrolladores

**Propósito**: Vista detallada del consumo individual de cada desarrollador.

**Layout**: Mismo wrapper que Overview.

**Componentes**:
- **Tabs**: 3 botones con avatar + nombre. Activo: fondo `#121e30`, border accent. Border-radius 8px, padding 8px 18px
- **KPIs** (grid 5 columnas): Tokens input | Tokens output | Costo total | Requests | Ranking
- **Chart row** (`1.8fr 1fr`): Distribución de tareas (donut) | Modelos utilizados (barras horizontales)
- **Chart full-width**: Actividad propia en el tiempo (line chart, 150px alto)
- **Tabla de sesiones**: columnas Hora | Tarea | Modelo | Input | Output | Costo. Tags de tarea con color por categoría. Costo en color de acento.

**Interacción**: Al cambiar de tab se recarga toda la sección con los datos del dev seleccionado.

---

### 4. Pantalla Actividad

**Propósito**: Análisis de patrones de uso del equipo completo.

**Layout**: Mismo wrapper que Overview.

**Componentes**:
- **Chart row** (`1.8fr 1fr`): Actividad por hora del día (line, datos de "hoy") | Participación por dev (donut, % del total de tokens)
- **Mapa de calor**: 7 filas (días) × 24 columnas (horas). Cada celda 18px alto, border-radius 2px. Color base `#121e30`, celdas activas con color de acento y opacidad proporcional al valor (0.12 + value/max × 0.83). Label de día 26px a la izquierda.
- **Log de sesiones**: tabla completa con columnas Hora | Desarrollador (con dot de color) | Tarea (tag coloreado) | Modelo | Input | Output | Costo

---

## Paletas de Color

El sistema soporta 5 paletas intercambiables (se guarda en localStorage):

| Nombre | Accent | Accent Hi | Accent BG |
|--------|--------|-----------|-----------|
| Verde (default) | `#22c55e` | `#4ade80` | `rgba(34,197,94,0.08)` |
| Índigo | `#6366f1` | `#818cf8` | `rgba(99,102,241,0.08)` |
| Azul | `#38bdf8` | `#7dd3fc` | `rgba(56,189,248,0.08)` |
| Ámbar | `#f59e0b` | `#fcd34d` | `rgba(245,158,11,0.08)` |
| Rosa | `#f43f5e` | `#fb7185` | `rgba(244,63,94,0.08)` |

## Design Tokens

```
/* Backgrounds */
--bg0: #060c14   /* App background */
--bg1: #0c1522   /* Cards */
--bg2: #121e30   /* Inputs, hover */
--bg3: #1a2840   /* Focus state */

/* Text */
--t1: #eef4ff    /* Primary */
--t2: #7d95b0    /* Secondary */
--t3: #3d5268    /* Muted */

/* Borders */
--br: rgba(255,255,255,0.05)

/* Border radius */
--r: 12px        /* Cards */
--rs: 8px        /* Inputs, buttons */

/* Typography */
--ff: 'Space Grotesk', sans-serif
--fm: 'JetBrains Mono', monospace
```

## State Management

Variables de estado necesarias:
- `config.developers[]` — array de 3 nombres de devs (localStorage)
- `config.teamName` — nombre del equipo (localStorage)
- `config.mainModel` — modelo principal (localStorage)
- `config.palette` — paleta activa: 'green'|'indigo'|'blue'|'amber'|'rose' (localStorage)
- `currentPeriod` — 'today'|'week'|'month'
- `currentView` — 'overview'|'developers'|'activity'
- `selectedDev` — 0|1|2 (para pantalla de desarrolladores)

## Estructura de datos por periodo

```typescript
interface PeriodData {
  labels: string[];         // ej: ['Lun','Mar',...] o ['00h','01h',...]
  developers: DevData[];    // array de 3
}

interface DevData {
  tokens: { input: number; output: number };
  requests: number;
  costUSD: number;
  tasks: Record<string, number>;      // {Código: 52, Debug: 38, ...}
  activity: number[];                  // array de valores por label
  modelUsage: Record<string, number>; // {'Claude 3.5': 89, ...}
}
```

## Librerías Utilizadas (en el prototipo)

| Librería | Versión | Uso |
|----------|---------|-----|
| Chart.js | 4.4.0 | Todas las gráficas (line, bar, doughnut) |
| Space Grotesk | Google Fonts | Tipografía principal |
| JetBrains Mono | Google Fonts | Números y monospace |

Para producción se recomienda **Recharts** (React) o **Chart.js** con wrapper de React, y las fuentes vía sistema de la app.

## Módulos / Componentes sugeridos

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PalettePicker.tsx
│   ├── overview/
│   │   ├── KPIGrid.tsx
│   │   ├── DeveloperCard.tsx
│   │   ├── ActivityChart.tsx
│   │   ├── TaskTypeChart.tsx
│   │   ├── TokenComparisonChart.tsx
│   │   └── ModelUsageChart.tsx
│   ├── developers/
│   │   ├── DevTabs.tsx
│   │   ├── DevDetailKPIs.tsx
│   │   ├── DevCharts.tsx
│   │   └── SessionsTable.tsx
│   ├── activity/
│   │   ├── HourlyChart.tsx
│   │   ├── ParticipationChart.tsx
│   │   ├── HeatMap.tsx
│   │   └── SessionsLog.tsx
│   └── settings/
│       └── SettingsModal.tsx
├── hooks/
│   ├── useConfig.ts        // localStorage config
│   └── useDashboardData.ts // fetching / demo data
├── types/
│   └── dashboard.ts
└── pages/
    ├── Login.tsx
    └── Dashboard.tsx
```

## Integración con datos reales

El prototipo usa datos demo hardcodeados. Para conectar datos reales:
1. Reemplazar `DEMO_DATA` por llamadas a API (ej: `GET /api/usage?period=week`)
2. El shape de respuesta debe seguir la interfaz `PeriodData` descrita arriba
3. Los nombres de developers y modelos se configuran via Settings modal y se guardan en localStorage (o backend de configuración)
4. El costo estimado se calcula según el modelo: Claude 3.5 Sonnet ~$3/MTok input, $15/MTok output

## Archivos incluidos

| Archivo | Descripción |
|---------|-------------|
| `AI Monitor.html` | Prototipo completo (login + 3 pantallas + modal de configuración) |

## Notas para el desarrollador

- El **mapa de calor** se implementa con CSS Grid puro (24 columnas). No usa ninguna librería.
- La **sparkline** en las dev cards es un SVG inline generado desde los datos de actividad.
- El **cambio de paleta** usa CSS Custom Properties en el elemento `body[data-pal=X]`. En React, usar `document.body.setAttribute('data-pal', pal)` o un ThemeProvider.
- La **configuración persiste en localStorage** bajo la clave `'aim-cfg'`.
- Los **gráficos se destruyen y recrean** al cambiar período o vista (no se actualizan en-place). En producción, prefer actualizar los datos del chart con `.update()`.
