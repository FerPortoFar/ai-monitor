import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { PeriodData, Session, DashboardConfig, Developer, ProjectData } from '../../types/dashboard';
import DataTable from '../shared/DataTable';

const RC = ['#fbbf24', '#94a3b8', '#cd8c52'];
const TK_COLS = ['#818cf8', '#fbbf24', '#38bdf8', '#34d399', '#f87171'];
const TASK_COLORS: Record<string, string> = { Código: '#818cf8', Debug: '#f87171', Explicación: '#38bdf8', Revisión: '#fbbf24', Docs: '#34d399' };
const TT = { backgroundColor: '#0c1522', borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, titleColor: '#eef4ff', bodyColor: '#7d95b0', padding: 10 };

function fT(n: number) { return n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n); }
function fC(n: number) { return '$'+n.toFixed(2); }
function inits(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

interface Props { data: PeriodData | null; sessions: Session[]; config: DashboardConfig; devs: Developer[]; loading: boolean }

function DevDetail({ data, sessions, devs, devIdx, localIdx }: { data: PeriodData; sessions: Session[]; devs: Developer[]; devIdx: number; localIdx: number }) {
  const taskRef = useRef<HTMLCanvasElement>(null);
  const mdlRef  = useRef<HTMLCanvasElement>(null);
  const actRef  = useRef<HTMLCanvasElement>(null);
  const taskCi  = useRef<Chart | null>(null);
  const mdlCi   = useRef<Chart | null>(null);
  const actCi   = useRef<Chart | null>(null);

  const dev  = data.developers[devIdx];
  const info = devs[localIdx];
  const c    = info?.color || '#818cf8';
  const name = info?.name  || `Dev ${devIdx + 1}`;
  const total = dev.tokens.input + dev.tokens.output;
  const topTask = Object.entries(dev.tasks).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const topMdl  = Object.entries(dev.modelUsage).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const active = data.configuredIndices ?? devs.map((_, i) => i);
  const ranked = active.map(i => ({ i, t: data.developers[i].tokens.input + data.developers[i].tokens.output })).sort((a, b) => b.t - a.t);
  const rank = ranked.findIndex(r => r.i === devIdx) + 1;

  const mySessions = sessions.filter(s => s.devIndex === devIdx);

  useEffect(() => {
    if (!taskRef.current || !mdlRef.current || !actRef.current) return;
    taskCi.current?.destroy(); mdlCi.current?.destroy(); actCi.current?.destroy();

    const tkKeys = Object.keys(dev.tasks);
    taskCi.current = new Chart(taskRef.current, {
      type: 'doughnut',
      data: { labels: tkKeys, datasets: [{ data: tkKeys.map(k => dev.tasks[k]), backgroundColor: TK_COLS, borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, boxHeight: 10, padding: 10, color: '#7d95b0' } }, tooltip: { ...TT } } },
    });

    const mKeys = Object.keys(dev.modelUsage);
    mdlCi.current = new Chart(mdlRef.current, {
      type: 'bar',
      data: { labels: mKeys, datasets: [{ data: mKeys.map(k => dev.modelUsage[k]), backgroundColor: ['#818cf8cc','#fbbf24cc','#38bdf8cc'], borderRadius: 4, borderSkipped: false }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...TT, callbacks: { label: (ctx: any) => ` ${ctx.parsed.x} requests` } } }, scales: { x: { grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } } },
    });

    actCi.current = new Chart(actRef.current, {
      type: 'line',
      data: { labels: data.labels, datasets: [{ label: name, data: dev.activity, borderColor: c, backgroundColor: c + '12', borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 6, pointBackgroundColor: c, pointBorderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip: { ...TT, callbacks: { label: (ctx: any) => ` ${name}: ${fT(ctx.parsed.y)}` } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { font: { size: 10 }, callback: (v: any) => fT(v) } } } },
    });

    return () => { taskCi.current?.destroy(); mdlCi.current?.destroy(); actCi.current?.destroy(); };
  }, [devIdx, data, devs]);

  return (
    <>
      <div className="dd-kpis">
        <div className="dd-kpi"><div className="dd-lbl">Tokens input</div><div className="dd-val" style={{ color: c }}>{fT(dev.tokens.input)}</div><div className="dd-sub">Prompts enviados</div></div>
        <div className="dd-kpi"><div className="dd-lbl">Tokens output</div><div className="dd-val" style={{ color: c }}>{fT(dev.tokens.output)}</div><div className="dd-sub">Respuestas recibidas</div></div>
        <div className="dd-kpi"><div className="dd-lbl">Costo total</div><div className="dd-val">{fC(dev.costUSD)}</div><div className="dd-sub">{fC(dev.requests ? dev.costUSD / dev.requests : 0)} por request</div></div>
        <div className="dd-kpi"><div className="dd-lbl">Requests</div><div className="dd-val">{dev.requests}</div><div className="dd-sub">{topMdl} más usado</div></div>
        <div className="dd-kpi"><div className="dd-lbl">Ranking</div><div className="dd-val" style={{ fontFamily: 'var(--ff)', color: RC[rank-1] || RC[2] }}>#{rank}</div><div className="dd-sub">Tarea top: {topTask}</div></div>
      </div>
      <div className="crow" style={{ marginBottom: 14 }}>
        <div className="cc">
          <div className="cc-h"><div><div className="cc-tit">Distribución de tareas</div><div className="cc-sub">Requests por tipo</div></div></div>
          <div style={{ position: 'relative', height: 180 }}><canvas ref={taskRef} /></div>
        </div>
        <div className="cc">
          <div className="cc-h"><div><div className="cc-tit">Modelos utilizados</div><div className="cc-sub">Requests por modelo</div></div></div>
          <div style={{ position: 'relative', height: 180 }}><canvas ref={mdlRef} /></div>
        </div>
      </div>
      <div className="cc" style={{ marginBottom: 14 }}>
        <div className="cc-h"><div><div className="cc-tit">Actividad — {name}</div><div className="cc-sub">Tokens a lo largo del tiempo</div></div></div>
        <div style={{ position: 'relative', height: 150 }}><canvas ref={actRef} /></div>
      </div>
      {dev.projects && Object.keys(dev.projects).length > 0 && (() => {
        const projRows = Object.entries(dev.projects as Record<string, ProjectData>).map(([, p]) => ({
          displayName:  p.displayName,
          tokensOutput: p.tokens.output,
          tokensInput:  p.tokens.input,
          costUSD:      p.costUSD || 0,
          requests:     p.requests,
          topModel:     Object.entries(p.modelUsage || {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—',
          lastWorked:   p.lastWorked || '',
        }));
        return (
          <DataTable title={`Proyectos de ${name}`} subtitle={`${projRows.length} proyectos`}
            storageKey={`proj-${name}`} data={projRows}
            columns={[
              { key: 'displayName',  label: 'Proyecto',       sortVal: r => r.displayName,
                render: r => <span style={{ fontWeight: 500 }}>{r.displayName}</span>, printVal: r => r.displayName },
              { key: 'tokensOutput', label: 'Output tokens',  align: 'right', sortVal: r => r.tokensOutput,
                render: r => <span style={{ fontFamily: 'var(--fm)', color: c }}>{fT(r.tokensOutput)}</span>, printVal: r => fT(r.tokensOutput) },
              { key: 'tokensInput',  label: 'Input tokens',   align: 'right', sortVal: r => r.tokensInput,  hidden: true,
                render: r => <span style={{ fontFamily: 'var(--fm)' }}>{fT(r.tokensInput)}</span>, printVal: r => fT(r.tokensInput) },
              { key: 'costUSD',      label: 'Costo est.',     align: 'right', sortVal: r => r.costUSD,
                render: r => <span style={{ fontFamily: 'var(--fm)', color: 'var(--a)' }}>{fC(r.costUSD)}</span>, printVal: r => fC(r.costUSD) },
              { key: 'requests',     label: 'Requests',       align: 'right', sortVal: r => r.requests,
                render: r => <span style={{ fontFamily: 'var(--fm)' }}>{r.requests}</span>, printVal: r => String(r.requests) },
              { key: 'topModel',     label: 'Modelo principal', sortVal: r => r.topModel,
                render: r => <span style={{ color: 'var(--t2)', fontSize: 12 }}>{r.topModel}</span>, printVal: r => r.topModel },
              { key: 'lastWorked',   label: 'Último trabajo', sortVal: r => r.lastWorked,
                render: r => <span style={{ color: 'var(--t2)', fontSize: 12 }}>{r.lastWorked ? new Date(r.lastWorked + 'T12:00:00').toLocaleDateString('es-AR') : '—'}</span>,
                printVal: r => r.lastWorked || '—' },
            ]} />
        );
      })()}

      {mySessions.length > 0 && (() => {
        const buckets = [
          { label: 'Micro (<2K)',    color: '#818cf8', count: 0, max: 2000     },
          { label: 'Pequeña (2-10K)',color: '#38bdf8', count: 0, max: 10000    },
          { label: 'Media (10-50K)', color: '#fbbf24', count: 0, max: 50000    },
          { label: 'Grande (>50K)',  color: '#34d399', count: 0, max: Infinity },
        ];
        for (const s of mySessions) {
          const t = s.inputTokens + s.outputTokens;
          const b = buckets.find(b => t < b.max)!;
          b.count++;
        }
        const maxCount = Math.max(...buckets.map(b => b.count), 1);
        return (
          <div className="cc" style={{ marginBottom: 14 }}>
            <div className="cc-h"><div><div className="cc-tit">Distribución por tamaño de sesión</div><div className="cc-sub">Tokens totales por conversación (input + output)</div></div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
              {buckets.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--t2)', width: 110, flexShrink: 0 }}>{b.label}</span>
                  <div style={{ flex: 1, height: 14, background: 'var(--bg2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(b.count / maxCount) * 100}%`, height: '100%', background: b.color, borderRadius: 3, transition: 'width .4s ease', opacity: 0.85 }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: b.color, width: 26, textAlign: 'right', flexShrink: 0 }}>{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <DataTable title={`Sesiones de ${name}`} subtitle={`${mySessions.length} registros`}
        storageKey={`sess-dev-${name}`} data={mySessions}
        columns={[
          { key: 'ts',          label: 'Hora',    sortVal: s => s.ts,
            render: s => <span style={{ color: 'var(--t2)', fontFamily: 'var(--fm)' }}>{s.ts}</span>, printVal: s => s.ts },
          { key: 'task',        label: 'Tarea',   sortVal: s => s.task,
            render: s => <span className="tag" style={{ background: (TASK_COLORS[s.task]||'#818cf8')+'18', color: TASK_COLORS[s.task]||'#818cf8' }}>{s.task}</span>, printVal: s => s.task },
          { key: 'model',       label: 'Modelo',  sortVal: s => s.model,
            render: s => <span style={{ color: 'var(--t2)' }}>{s.model}</span>, printVal: s => s.model },
          { key: 'inputTokens', label: 'Input',   align: 'right', sortVal: s => s.inputTokens,
            render: s => <span style={{ fontFamily: 'var(--fm)' }}>{fT(s.inputTokens)}</span>, printVal: s => fT(s.inputTokens) },
          { key: 'outputTokens',label: 'Output',  align: 'right', sortVal: s => s.outputTokens,
            render: s => <span style={{ fontFamily: 'var(--fm)' }}>{fT(s.outputTokens)}</span>, printVal: s => fT(s.outputTokens) },
          { key: 'costUSD',     label: 'Costo',   align: 'right', sortVal: s => s.costUSD,
            render: s => <span style={{ fontFamily: 'var(--fm)', color: 'var(--a)' }}>{fC(s.costUSD)}</span>, printVal: s => fC(s.costUSD) },
        ]} />
    </>
  );
}

export default function Developers({ data, sessions, devs, loading }: Props) {
  const active     = data ? (data.configuredIndices ?? devs.map((_, i) => i)).filter(i => i < devs.length) : [];
  const [selLocal, setSelLocal] = useState(0);

  if (loading || !data) return <div style={{ color: 'var(--t2)', padding: '40px 0' }}>Cargando…</div>;
  if (active.length === 0) return <div style={{ color: 'var(--t2)', padding: '40px 0' }}>No hay desarrolladores configurados.</div>;

  const selGlobal = active[selLocal] ?? active[0];

  return (
    <>
      <div className="dtabs">
        {active.map((di, li) => {
          const info = devs[di];
          const c    = info?.color || '#818cf8';
          const name = info?.name  || `Dev ${di + 1}`;
          return (
            <button key={di} className={`dtab${selLocal === li ? ' on' : ''}`} onClick={() => setSelLocal(li)}>
              <div className="dtab-av" style={{ background: `${c}18`, color: c }}>{inits(name)}</div>
              {name}
            </button>
          );
        })}
      </div>
      <DevDetail data={data} sessions={sessions} devs={devs} devIdx={selGlobal} localIdx={active.indexOf(selGlobal)} />
    </>
  );
}
