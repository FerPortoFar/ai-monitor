import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { PeriodData, Session, HeatmapRow, DashboardConfig, Developer } from '../../types/dashboard';
import DataTable from '../shared/DataTable';

const TASK_COLORS: Record<string, string> = { Código: '#818cf8', Debug: '#f87171', Explicación: '#38bdf8', Revisión: '#fbbf24', Docs: '#34d399' };
const TT = { backgroundColor: '#0c1522', borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, titleColor: '#eef4ff', bodyColor: '#7d95b0', padding: 10 };
const TODAY_LABELS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`);

function fT(n: number) { return n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n); }
function fC(n: number) { return '$'+n.toFixed(2); }

interface Props { data: PeriodData | null; sessions: Session[]; heatmap: HeatmapRow[]; config: DashboardConfig; devs: Developer[]; loading: boolean }

export default function Activity({ data, sessions, heatmap, devs, loading }: Props) {
  const hrRef  = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);
  const hrCi   = useRef<Chart | null>(null);
  const pieCi  = useRef<Chart | null>(null);

  const active      = data ? (data.configuredIndices ?? devs.map((_, i) => i)).filter(i => i < devs.length) : [];
  const activeDevs  = active.map(i => devs[i]);

  useEffect(() => {
    if (!hrRef.current || !pieRef.current || !data) return;
    hrCi.current?.destroy();
    pieCi.current?.destroy();

    hrCi.current = new Chart(hrRef.current, {
      type: 'line',
      data: {
        labels: TODAY_LABELS,
        datasets: active.map((di, li) => {
          const dev  = data.developers[di];
          const info = devs[di];
          const c    = info?.color || '#818cf8';
          const name = info?.name  || `Dev ${di + 1}`;
          return { label: name, data: dev.activity, borderColor: c, backgroundColor: c + '12', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 2, pointHoverRadius: 5, pointBackgroundColor: c, pointBorderWidth: 0 };
        }),
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { ...TT, callbacks: { label: (c: any) => ` ${c.dataset.label}: ${fT(c.parsed.y)}` } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { font: { size: 10 }, callback: (v: any) => fT(v) } } },
      },
    });

    const totals    = active.map(i => data.developers[i].tokens.input + data.developers[i].tokens.output);
    const grandTotal = totals.reduce((a, b) => a + b, 0);
    const names  = activeDevs.map(d => d?.name || '?');
    const colors = activeDevs.map(d => (d?.color || '#818cf8') + 'cc');
    pieCi.current = new Chart(pieRef.current, {
      type: 'doughnut',
      data: { labels: names, datasets: [{ data: totals, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, boxHeight: 10, padding: 10, color: '#7d95b0' } },
          tooltip: { ...TT, callbacks: { label: (c: any) => ` ${c.label}: ${fT(c.parsed)} (${((c.parsed / grandTotal) * 100).toFixed(0)}%)` } },
        },
      },
    });

    return () => { hrCi.current?.destroy(); pieCi.current?.destroy(); };
  }, [data, devs]);

  if (loading || !data) return <div style={{ color: 'var(--t2)', padding: '40px 0' }}>Cargando…</div>;

  const maxV = heatmap.length ? Math.max(...heatmap.flatMap(r => r.v)) : 1;
  const hourLabels = ['0h','','','3h','','','6h','','','9h','','','12h','','','15h','','','18h','','','21h','',''];

  return (
    <>
      <div className="crow" style={{ marginBottom: 14 }}>
        <div className="cc">
          <div className="cc-h">
            <div><div className="cc-tit">Actividad por hora — equipo</div><div className="cc-sub">Tokens por hora del día (hoy)</div></div>
            <div className="leg">
              {activeDevs.map((d, i) => (
                <div key={i} className="leg-i"><div className="leg-d" style={{ background: d?.color }} />{d?.name}</div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: 180 }}><canvas ref={hrRef} /></div>
        </div>
        <div className="cc">
          <div className="cc-h"><div><div className="cc-tit">Participación por dev</div><div className="cc-sub">% del total de tokens</div></div></div>
          <div style={{ position: 'relative', height: 180 }}><canvas ref={pieRef} /></div>
        </div>
      </div>

      <div className="cc" style={{ marginBottom: 14 }}>
        <div className="cc-h">
          <div><div className="cc-tit">Mapa de calor — semana actual</div><div className="cc-sub">Actividad por hora y día de la semana</div></div>
          <div className="leg" style={{ alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>Bajo</span>
            <div style={{ width: 50, height: 8, borderRadius: 4, background: 'linear-gradient(90deg,var(--bg3),var(--a))', margin: '0 6px' }} />
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>Alto</span>
          </div>
        </div>
        <div>
          {heatmap.map((row, ri) => (
            <div key={ri} className="hmap-row">
              <span className="hmap-day">{row.day}</span>
              <div className="hmap-cells">
                {row.v.map((v, ci) => {
                  const op = v === 0 ? 1 : Math.max(0.12, Math.min(0.95, 0.12 + (v / maxV) * 0.83));
                  return <div key={ci} className="hmap-cell" title={`${v} actividad`} style={v === 0 ? { background: 'var(--bg2)' } : { background: 'var(--a)', opacity: op }} />;
                })}
              </div>
            </div>
          ))}
          <div className="hmap-hours">
            {hourLabels.map((l, i) => <div key={i} className="hmap-hour">{l}</div>)}
          </div>
        </div>
      </div>

      <DataTable
        title="Registro de sesiones"
        subtitle={`Últimas ${sessions.length} actividades`}
        storageKey="activity-sessions"
        data={sessions}
        columns={[
          { key: 'ts',          label: 'Hora',         sortVal: s => s.ts,
            render: s => <span style={{ color: 'var(--t2)', fontFamily: 'var(--fm)' }}>{s.ts}</span>, printVal: s => s.ts },
          { key: 'devIndex',    label: 'Desarrollador', sortVal: s => devs[s.devIndex]?.name || '',
            render: s => { const d = devs[s.devIndex]; const dc = d?.color||'#818cf8'; const dn = d?.name||`Dev ${s.devIndex+1}`;
              return <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><span style={{ width:8, height:8, borderRadius:'50%', background:dc, display:'inline-block' }}/>{dn}</span>; },
            printVal: s => devs[s.devIndex]?.name || `Dev ${s.devIndex+1}` },
          { key: 'task',        label: 'Tarea',        sortVal: s => s.task,
            render: s => <span className="tag" style={{ background:(TASK_COLORS[s.task]||'#818cf8')+'18', color:TASK_COLORS[s.task]||'#818cf8' }}>{s.task}</span>, printVal: s => s.task },
          { key: 'model',       label: 'Modelo',       sortVal: s => s.model,
            render: s => <span style={{ color:'var(--t2)' }}>{s.model}</span>, printVal: s => s.model },
          { key: 'inputTokens', label: 'Input',        align: 'right', sortVal: s => s.inputTokens,
            render: s => <span style={{ fontFamily:'var(--fm)' }}>{fT(s.inputTokens)}</span>, printVal: s => fT(s.inputTokens) },
          { key: 'outputTokens',label: 'Output',       align: 'right', sortVal: s => s.outputTokens,
            render: s => <span style={{ fontFamily:'var(--fm)' }}>{fT(s.outputTokens)}</span>, printVal: s => fT(s.outputTokens) },
          { key: 'costUSD',     label: 'Costo',        align: 'right', sortVal: s => s.costUSD,
            render: s => <span style={{ fontFamily:'var(--fm)', color:'var(--a)' }}>{fC(s.costUSD)}</span>, printVal: s => fC(s.costUSD) },
        ]}
      />
    </>
  );
}
