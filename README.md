# AI Monitor

Dashboard para monitorear el uso de agentes IA (Claude Code) por equipos de desarrollo. Muestra tokens consumidos, costos estimados, tipos de tareas, actividad por hora y métricas comparativas entre desarrolladores.

![Stack](https://img.shields.io/badge/React-TypeScript-blue) ![Stack](https://img.shields.io/badge/Node.js-Express-green) ![Stack](https://img.shields.io/badge/Chart.js-4.x-orange)

---

## Pantallas

| Vista | Descripción |
|-------|-------------|
| **Overview** | KPIs del equipo, tarjetas por dev, gráficos de actividad, historial 6 meses, radar comparativo |
| **Desarrolladores** | Detalle individual: tareas, modelos, proyectos, distribución de sesiones |
| **Actividad** | Mapa de calor semanal, actividad por hora, log de sesiones |
| **Gestión de agentes** | Alta/baja de agentes, estado online/offline, instrucciones de instalación |

---

## Arquitectura

```
ai-monitor/          ← Dashboard (servidor + cliente)
  server/            ← Express API
  client/            ← React + TypeScript + Vite

ai-monitor-agent/    ← Agente Node.js (se instala en cada dev)
```

El **agente** corre en la máquina de cada desarrollador, lee los archivos `.jsonl` generados por Claude Code en `~/.claude/projects/` y sube las estadísticas al servidor cada 5 minutos.

---

## Requisitos

- Node.js 18+
- npm

---

## Instalación del dashboard

```bash
# Clonar
git clone https://github.com/FerPortoFar/ai-monitor.git
cd ai-monitor/ai-monitor

# Instalar dependencias
npm install
cd client && npm install && cd ..

# Desarrollo
npm run dev          # servidor en :3001
cd client && npm run dev   # cliente en :5173
```

### Variables de entorno (opcional)

Crear `server/.env`:

```env
PORT=3001
SESSION_SECRET=tu-secreto-seguro
```

---

## Instalación del agente (por desarrollador)

```bash
cd ai-monitor-agent
npm install
node agent.js
```

Para que arranque automáticamente al iniciar sesión en Windows:

```bash
node install-task.js
```

El agente crea `agent.config.json` en su primera ejecución:

```json
{
  "token": "uuid-único-por-dev",
  "serverUrl": "http://ip-del-servidor:3001",
  "claudeDir": "C:/Users/usuario/.claude"
}
```

> Editá `serverUrl` para que apunte al servidor donde corre el dashboard.

---

## Login

| Usuario | Contraseña |
|---------|------------|
| `MonitorIA` | `MIA` + año + (mes actual + 1) |

Ejemplo: en junio 2026 → `MIA20267`. La contraseña rota automáticamente cada mes.

---

## Funcionalidades

- **Tendencias** `▲▼ %` vs período anterior en todos los KPIs
- **Score de eficiencia** por dev (tokens output / request)
- **Alertas de presupuesto** configurables por dev (umbral mensual en USD)
- **Historial de costos** — gráfico de barras últimos 6 meses
- **Radar comparativo** con tabla de scores: Volumen, Frecuencia, Eficiencia, Variedad, Constancia
- **Distribución de sesiones** por tamaño (Micro / Pequeña / Media / Grande)
- **Tabla de proyectos** global del equipo
- **Export CSV** en todas las tablas
- **Modo demo** sin necesidad de login ni agentes instalados
- **5 paletas de color** intercambiables
- Tablas con sort, columnas ocultas/visibles, drag-to-reorder, print

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Chart.js 4 |
| Backend | Node.js, Express, sesiones en memoria |
| Agente | Node.js CommonJS, sin dependencias externas |
| Estilos | CSS puro con custom properties |
| Fuentes | Space Grotesk, JetBrains Mono |

---

## Archivos excluidos del repo

Por seguridad, no se versionan:

- `server/data/stats/` — estadísticas reales de cada agente
- `server/data/sessions/` — sesiones históricas
- `server/data/agents.json` — tokens de agentes registrados
- `ai-monitor-agent/agent.config.json` — configuración local con token

---

## Licencia

MIT
