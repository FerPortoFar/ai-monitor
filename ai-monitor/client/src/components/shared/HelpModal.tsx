interface Props { onClose: () => void }

export default function HelpModal({ onClose }: Props) {
  return (
    <div className="ov open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="help-modal">
        <div className="help-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--a)" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="var(--a)" stroke="none"/>
            </svg>
            <h3>Manual de usuario — AI Monitor</h3>
          </div>
          <button className="mx" onClick={onClose}>✕</button>
        </div>

        <div className="help-body">

          {/* INTRO */}
          <section className="hs">
            <h2>¿Qué es AI Monitor?</h2>
            <p>AI Monitor es un dashboard que centraliza el consumo de agentes IA (Claude Code) de todos los desarrolladores del equipo. Muestra cuántos tokens se usaron, cuánto costó, qué tipo de tareas se realizaron y qué tan activo y eficiente es cada dev.</p>
            <div className="h-tip">
              <strong>URL pública:</strong>{' '}
              <a href="https://gracious-liberation-production-43da.up.railway.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--a)', textDecoration: 'none' }}>
                gracious-liberation-production-43da.up.railway.app
              </a>
              <br />
              <span style={{ marginTop: 4, display: 'block' }}><strong>Demo:</strong> clic en "Modo demo →" para explorar el panel sin credenciales.</span>
            </div>
            <div className="h-tip" style={{ marginTop: 8 }}>
              <strong>Dato clave:</strong> los datos llegan automáticamente desde el agente instalado en cada máquina, sin que el dev tenga que hacer nada.
            </div>
          </section>

          {/* OVERVIEW */}
          <section className="hs">
            <h2>📊 Overview — Pantalla principal</h2>

            <h3>KPI Cards (fila superior)</h3>
            <p>Muestran los totales del equipo para el período seleccionado (Hoy / Esta semana / Este mes).</p>
            <table className="h-table">
              <tbody>
                <tr><td><strong>Total Tokens</strong></td><td>Suma de todos los tokens procesados (input + output) por el equipo.</td></tr>
                <tr><td><strong>Costo Estimado</strong></td><td>Costo en USD calculado según el modelo usado. Configurable en Ajustes.</td></tr>
                <tr><td><strong>Total Requests</strong></td><td>Cantidad de llamadas individuales al API de IA.</td></tr>
                <tr><td><strong>Más Activo</strong></td><td>El desarrollador con mayor volumen de tokens en el período.</td></tr>
              </tbody>
            </table>
            <p>Las flechas <span className="h-up">▲ X%</span> / <span className="h-down">▼ X%</span> indican la variación respecto al período anterior del mismo tipo (ej: esta semana vs la semana pasada).</p>

            <h3>Tarjetas de desarrolladores</h3>
            <p>Una tarjeta por cada dev con:</p>
            <table className="h-table">
              <tbody>
                <tr><td><strong>Barra input/output</strong></td><td>La porción azul clara es input (prompts enviados), la más oscura es output (respuestas recibidas). Más output = respuestas más largas y detalladas.</td></tr>
                <tr><td><strong>Barra de eficiencia</strong></td><td>Tokens de output dividido la cantidad de requests. Mayor barra = cada consulta genera más contenido útil. Un dev eficiente hace pocas consultas largas en vez de muchas cortas.</td></tr>
                <tr><td><strong>Tendencia</strong></td><td>Comparación con el período anterior. <span className="h-up">▲</span> significa que usó más IA que antes, <span className="h-down">▼</span> menos.</td></tr>
                <tr><td><strong>Badge ⚠ Budget</strong></td><td>Aparece cuando la proyección mensual de costo supera el límite configurado en Ajustes. "~ Budget" avisa cuando está al 80%.</td></tr>
                <tr><td><strong>Sparkline</strong></td><td>Mini gráfico de actividad del dev en el período seleccionado.</td></tr>
              </tbody>
            </table>

            <h3>Actividad en el tiempo</h3>
            <p>Gráfico de líneas con una línea por desarrollador. El eje Y muestra tokens de output; el eje X muestra el tiempo (horas si es "Hoy", días si es "Semana", semanas si es "Mes"). Pasando el cursor sobre el gráfico se ven los valores exactos de todos los devs en ese punto.</p>

            <h3>Tipos de tarea</h3>
            <p>Gráfico de dona que muestra la distribución de consultas por categoría:</p>
            <table className="h-table">
              <tbody>
                <tr><td><span style={{color:'#818cf8'}}>■</span> <strong>Código</strong></td><td>Generación o modificación de código fuente.</td></tr>
                <tr><td><span style={{color:'#f87171'}}>■</span> <strong>Debug</strong></td><td>Consultas relacionadas a errores, bugs o problemas.</td></tr>
                <tr><td><span style={{color:'#38bdf8'}}>■</span> <strong>Explicación</strong></td><td>El dev preguntó qué hace algo o cómo funciona.</td></tr>
                <tr><td><span style={{color:'#fbbf24'}}>■</span> <strong>Revisión</strong></td><td>Pedidos de revisión, mejora u optimización.</td></tr>
                <tr><td><span style={{color:'#34d399'}}>■</span> <strong>Docs</strong></td><td>Generación de documentación, README o comentarios.</td></tr>
              </tbody>
            </table>

            <h3>Input vs Output por dev</h3>
            <p>Barras apiladas: la parte opaca es el input (tokens que el dev envió) y la parte transparente es el output (tokens que recibió de la IA). Una barra con mucho output indica que la IA generó respuestas extensas para ese dev.</p>

            <h3>Modelos utilizados</h3>
            <p>Barras horizontales con el total de requests por modelo. Útil para ver si el equipo está usando modelos caros (Opus) cuando podría alcanzar con modelos más económicos (Haiku).</p>

            <h3>Historial de costos — 6 meses</h3>
            <p>Gráfico de barras agrupadas mostrando el costo estimado por dev en los últimos 6 meses calendario. Permite detectar tendencias de gasto: si un dev aumenta mes a mes puede ser señal de que está delegando más trabajo a la IA (positivo) o de uso ineficiente (si la eficiencia es baja).</p>
          </section>

          {/* RADAR */}
          <section className="hs">
            <h2>🕸️ Comparativa de desarrolladores (Radar)</h2>
            <p>El gráfico radar y la tabla debajo son la herramienta más completa para evaluar a los devs. Cada dimensión se normaliza de <strong>0 a 100</strong> relativa al mejor del equipo en ese período.</p>

            <table className="h-table">
              <thead><tr><th>Dimensión</th><th>Qué mide</th><th>Cómo mejorarlo</th></tr></thead>
              <tbody>
                <tr><td><strong>Volumen</strong></td><td>Total de tokens procesados (input + output). Mide el uso bruto de IA.</td><td>El dev con más volumen recibe 100. Los demás se miden contra él.</td></tr>
                <tr><td><strong>Frecuencia</strong></td><td>Cantidad de requests al API.</td><td>Muchas requests cortas bajan la eficiencia pero suben la frecuencia.</td></tr>
                <tr><td><strong>Eficiencia</strong></td><td>Tokens de output por request. Cuánto genera la IA por cada consulta.</td><td>Contexto bien preparado y preguntas claras aumentan la eficiencia.</td></tr>
                <tr><td><strong>Variedad</strong></td><td>Cuántos tipos de tarea distintos usa el dev (máx. 5).</td><td>Un dev que solo hace "Código" tiene variedad baja. Usar IA para Debug, Docs y Revisión también sube este score.</td></tr>
                <tr><td><strong>Constancia</strong></td><td>Proporción de días/slots del período con actividad.</td><td>Uso diario y regular sube este score. Uso en ráfagas esporádicas lo baja.</td></tr>
              </tbody>
            </table>

            <h3>Cómo leer la tabla de scores</h3>
            <p>Cada score tiene un color semáforo:</p>
            <ul className="h-list">
              <li><span className="h-dot" style={{background:'#4ade80'}} /> <strong>Verde (≥ 70)</strong> — dimensión fuerte del dev.</li>
              <li><span className="h-dot" style={{background:'#fbbf24'}} /> <strong>Amarillo (40–69)</strong> — margen de mejora.</li>
              <li><span className="h-dot" style={{background:'#f87171'}} /> <strong>Rojo (&lt; 40)</strong> — área débil a trabajar.</li>
            </ul>
            <p>La columna <strong>Score</strong> es el promedio de las 5 dimensiones. El dev con mayor score recibe el badge <strong>TOP</strong>.</p>
            <p>La columna <strong>Diagnóstico</strong> genera automáticamente un texto según el perfil del dev, por ejemplo:</p>
            <ul className="h-list">
              <li><em>"Dev más completo — uso intenso, eficiente y constante."</em></li>
              <li><em>"Buen nivel pero uso irregular — mejora la constancia."</em></li>
              <li><em>"Frecuente pero con sesiones cortas — profundiza cada consulta."</em></li>
              <li><em>"Bajo uso de IA — hay potencial sin explotar."</em></li>
            </ul>

            <div className="h-tip">
              <strong>Consejo de evaluación:</strong> no busques que todos tengan 100 en todo. Un dev con alta eficiencia y baja frecuencia puede ser más valioso que uno con muchas requests poco productivas.
            </div>
          </section>

          {/* DEVELOPERS */}
          <section className="hs">
            <h2>👤 Pantalla Desarrolladores</h2>
            <p>Vista detallada de cada desarrollador. Hacé clic en el nombre del dev en los tabs para cambiar.</p>

            <h3>KPIs individuales</h3>
            <table className="h-table">
              <tbody>
                <tr><td><strong>Tokens input</strong></td><td>Total de tokens que el dev envió a la IA en el período.</td></tr>
                <tr><td><strong>Tokens output</strong></td><td>Total de tokens que la IA generó para este dev.</td></tr>
                <tr><td><strong>Costo total</strong></td><td>Estimación en USD basada en el modelo y precios configurados.</td></tr>
                <tr><td><strong>Requests</strong></td><td>Cantidad de llamadas al API. Cada archivo .jsonl de Claude Code cuenta como una sesión.</td></tr>
                <tr><td><strong>Ranking</strong></td><td>Posición del dev en el equipo por volumen de tokens. 🥇 dorado, 🥈 plata, 🥉 bronce.</td></tr>
              </tbody>
            </table>

            <h3>Distribución de sesiones por tamaño</h3>
            <p>Clasifica las sesiones según el total de tokens (input + output):</p>
            <table className="h-table">
              <tbody>
                <tr><td><strong>Micro (&lt;2K)</strong></td><td>Consultas muy cortas. Preguntas puntuales o tests rápidos.</td></tr>
                <tr><td><strong>Pequeña (2–10K)</strong></td><td>Sesiones normales. Corresponde a la mayoría del trabajo diario.</td></tr>
                <tr><td><strong>Media (10–50K)</strong></td><td>Sesiones largas con contexto extenso. Refactors, explicaciones complejas.</td></tr>
                <tr><td><strong>Grande (&gt;50K)</strong></td><td>Sesiones muy grandes. Archivos grandes como contexto o conversaciones extensas.</td></tr>
              </tbody>
            </table>
            <p>Un dev con muchas sesiones <em>Micro</em> puede estar fragmentando el trabajo. Sesiones <em>Media</em> y <em>Grande</em> suelen ser más eficientes porque aprovechan mejor el contexto de la IA.</p>

            <h3>Tabla de proyectos</h3>
            <p>Lista los proyectos en los que el dev usó IA, con tokens, costo y último uso. Útil para ver en qué proyectos concentra el trabajo.</p>
          </section>

          {/* ACTIVIDAD */}
          <section className="hs">
            <h2>📅 Pantalla Actividad</h2>

            <h3>Actividad por hora — equipo</h3>
            <p>Muestra los tokens generados por hora del día de <strong>hoy</strong>. Permite ver en qué franja horaria el equipo es más activo con la IA. Picos en la mañana temprana o tarde de noche pueden indicar hábitos de trabajo fuera del horario estándar.</p>

            <h3>Participación por dev</h3>
            <p>Dona que muestra el porcentaje del total de tokens que aportó cada dev. Si un dev concentra más del 70% del total, el equipo puede estar distribuyendo mal la carga o ese dev tiene mucho más trabajo.</p>

            <h3>Mapa de calor semanal</h3>
            <p>Grilla de 7 días × 24 horas. Cada celda muestra la actividad de esa hora en ese día de la semana:</p>
            <ul className="h-list">
              <li><strong>Color oscuro (fondo)</strong> → sin actividad en esa hora.</li>
              <li><strong>Color con opacidad baja</strong> → poca actividad.</li>
              <li><strong>Color intenso</strong> → mucha actividad (valor cercano al máximo de la semana).</li>
            </ul>
            <p>Buscá columnas de horas con colores intensos para identificar los picos del equipo. Filas con poco color indican días de baja actividad.</p>

            <h3>Log de sesiones</h3>
            <p>Tabla con las últimas 300 sesiones del equipo ordenadas por fecha. Cada fila es una conversación completa con Claude Code. Las columnas son sortables y se pueden ocultar. Podés exportar a CSV para análisis externo.</p>
          </section>

          {/* CONFIGURACION */}
          <section className="hs">
            <h2>⚙️ Configuración</h2>
            <p>Accesible desde el ícono de engranaje en el sidebar.</p>
            <table className="h-table">
              <tbody>
                <tr><td><strong>Nombre del equipo</strong></td><td>Aparece en el header del dashboard.</td></tr>
                <tr><td><strong>Paleta de color</strong></td><td>Cambia el color de acento de toda la UI (Verde, Índigo, Azul, Ámbar, Rosa).</td></tr>
                <tr><td><strong>URL del servidor</strong></td><td>La dirección que los agentes deben usar para conectarse. Copiá esta URL al instalar el agente en una máquina nueva.</td></tr>
                <tr><td><strong>Precios por modelo</strong></td><td>Precio en USD por millón de tokens (input y output). Se descarga automáticamente al agente en cada ciclo. Actualizalos si Anthropic cambia los precios.</td></tr>
                <tr><td><strong>Umbrales de gasto mensual</strong></td><td>Límite de costo mensual por dev. Si la proyección supera el límite aparece el badge ⚠ en su tarjeta. El sistema proyecta el mes completo en base al período seleccionado.</td></tr>
              </tbody>
            </table>
          </section>

          {/* PERIODOS */}
          <section className="hs">
            <h2>🗓️ Períodos (Hoy / Semana / Mes)</h2>
            <p>Los tres botones en el topbar cambian el rango de datos mostrado:</p>
            <table className="h-table">
              <tbody>
                <tr><td><strong>Hoy</strong></td><td>Actividad del día actual, distribuida por hora (00h–23h).</td></tr>
                <tr><td><strong>Esta semana</strong></td><td>Últimos 7 días, agrupado por día de la semana.</td></tr>
                <tr><td><strong>Este mes</strong></td><td>Últimas 4 semanas, agrupado por semana.</td></tr>
              </tbody>
            </table>
            <p>Las tendencias <span className="h-up">▲▼</span> siempre comparan con el período inmediato anterior del mismo tipo (esta semana vs la semana pasada, este mes vs el mes pasado).</p>
            <div className="h-tip">
              <strong>Tip:</strong> seleccioná "Hoy" a mitad del día para ver qué está pasando en tiempo real. El agente actualiza los datos cada 5 minutos.
            </div>
          </section>

          {/* TABLAS */}
          <section className="hs">
            <h2>📋 Tablas de datos</h2>
            <p>Todas las tablas del sistema tienen las mismas funcionalidades:</p>
            <ul className="h-list">
              <li><strong>Ordenar:</strong> hacé clic en cualquier encabezado de columna para ordenar ascendente/descendente. Clic de nuevo para quitar el orden.</li>
              <li><strong>Columnas:</strong> botón "Columnas" → activá/desactivá columnas visibles. Arrastrá los encabezados para reordenarlas.</li>
              <li><strong>CSV:</strong> exporta las filas visibles (con el orden y columnas actuales) en formato compatible con Excel.</li>
              <li><strong>Imprimir:</strong> abre una ventana limpia lista para imprimir o guardar como PDF.</li>
            </ul>
            <p>Las preferencias de cada tabla (columnas visibles, orden, sort) se guardan automáticamente en el navegador.</p>
          </section>

          {/* AGENTES */}
          <section className="hs">
            <h2>🤖 Gestión de agentes</h2>
            <p>Accesible desde el ícono de usuario con (+) en el sidebar. Lista todos los agentes que reportaron al servidor.</p>
            <table className="h-table">
              <tbody>
                <tr><td><span className="adm-badge ok" style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'rgba(34,197,94,.12)',color:'#4ade80'}}>En línea</span></td><td>El agente reportó hace menos de 10 minutos.</td></tr>
                <tr><td><span style={{fontSize:10,background:'rgba(245,158,11,.12)',color:'#fcd34d',padding:'2px 8px',borderRadius:20}}>Hace Xm</span></td><td>Reportó hace menos de 1 hora. Normal si el dev no está trabajando.</td></tr>
                <tr><td><span style={{fontSize:10,background:'rgba(244,63,94,.12)',color:'#fb7185',padding:'2px 8px',borderRadius:20}}>Offline</span></td><td>Sin reporte en más de 2 horas en horario laboral. El agente puede haberse detenido.</td></tr>
              </tbody>
            </table>
            <p>Podés editar el <strong>alias</strong> (nombre que aparece en el dashboard) y el <strong>color</strong> de cada dev. Si eliminás un agente se borran también sus estadísticas.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
