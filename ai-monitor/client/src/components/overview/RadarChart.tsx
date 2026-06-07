import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { PeriodData, Developer } from '../../types/dashboard';

const TT = { backgroundColor: '#0c1522', borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, titleColor: '#eef4ff', bodyColor: '#7d95b0', padding: 10 };
const DIMS = ['Volumen', 'Frecuencia', 'Eficiencia', 'Variedad', 'Constancia'];

function norm(val: number, max: number) { return max > 0 ? Math.min(100, Math.round(val / max * 100)) : 0; }

function inits(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function generateDescription(scores: number[], devs: Developer[], idx: number): string {
  const [vol, frq, eff, vry, cns] = scores;
  const avg = scores.reduce((a, b) => a + b, 0) / 5;
  const dimNames = ['Volumen', 'Frecuencia', 'Eficiencia', 'Variedad', 'Constancia'];
  const best  = dimNames[scores.indexOf(Math.max(...scores))];
  const worst = dimNames[scores.indexOf(Math.min(...scores))];

  if (avg >= 75) {
    if (eff >= 80 && cns >= 70) return 'Dev más completo — uso intenso, eficiente y constante.';
    return `Rendimiento alto — destaca en ${best.toLowerCase()}.`;
  }
  if (avg >= 50) {
    if (cns < 35) return `Buen nivel pero uso irregular — mejora la constancia.`;
    if (eff < 35) return `Frecuente pero con sesiones cortas — profundiza cada consulta.`;
    if (vry < 35) return `Sólido en ${best.toLowerCase()} pero poco variado — explorá más tipos de tarea.`;
    return `Rendimiento estable — oportunidad de mejora en ${worst.toLowerCase()}.`;
  }
  if (vol < 30) return 'Bajo uso de IA — hay potencial sin explotar.';
  if (eff >= 60) return 'Pocas sesiones pero muy productivas.';
  return `Uso concentrado en ${best.toLowerCase()} — diversificar mejoraría el score.`;
}

export interface DevScores {
  name: string; color: string;
  scores: number[]; avg: number; description: string;
}

export function computeDevScores(data: PeriodData, activeDevs: Developer[], activeIndices: number[]): DevScores[] {
  const raw = activeIndices.map(di => {
    const dev = data.developers[di];
    return {
      volume:      dev.tokens.input + dev.tokens.output,
      requests:    dev.requests,
      efficiency:  dev.requests > 0 ? dev.tokens.output / dev.requests : 0,
      variety:     Object.keys(dev.tasks).length,
      consistency: dev.activity.filter(v => v > 0).length,
    };
  });

  const maxVol = Math.max(...raw.map(s => s.volume),      1);
  const maxReq = Math.max(...raw.map(s => s.requests),    1);
  const maxEff = Math.max(...raw.map(s => s.efficiency),  1);
  const maxVar = 5;
  const maxCon = data.labels.length || 1;

  return activeIndices.map((di, li) => {
    const s = raw[li];
    const scores = [
      norm(s.volume,      maxVol),
      norm(s.requests,    maxReq),
      norm(s.efficiency,  maxEff),
      norm(s.variety,     maxVar),
      norm(s.consistency, maxCon),
    ];
    const avg  = Math.round(scores.reduce((a, b) => a + b, 0) / 5);
    const dev  = activeDevs[li];
    return {
      name:        dev?.name  || `Dev ${li + 1}`,
      color:       dev?.color || '#818cf8',
      scores,
      avg,
      description: generateDescription(scores, activeDevs, li),
    };
  });
}

interface Props { data: PeriodData; activeDevs: Developer[]; activeIndices: number[] }

export default function RadarChart({ data, activeDevs, activeIndices }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ci  = useRef<Chart | null>(null);

  const devScores = computeDevScores(data, activeDevs, activeIndices);

  useEffect(() => {
    if (!ref.current || activeIndices.length === 0) return;
    ci.current?.destroy();

    ci.current = new Chart(ref.current, {
      type: 'radar',
      data: {
        labels: DIMS,
        datasets: devScores.map(ds => ({
          label:                ds.name,
          data:                 ds.scores,
          borderColor:          ds.color,
          backgroundColor:      ds.color + '18',
          borderWidth:          2,
          pointRadius:          3,
          pointHoverRadius:     5,
          pointBackgroundColor: ds.color,
          pointBorderWidth:     0,
        })),
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...TT, callbacks: { label: (ctx: any) => ` ${ctx.dataset.label} — ${DIMS[ctx.dataIndex]}: ${ctx.parsed.r}` } },
        },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { stepSize: 25, color: 'rgba(255,255,255,.25)', backdropColor: 'transparent', font: { size: 9 } },
            grid:        { color: 'rgba(255,255,255,.07)' },
            angleLines:  { color: 'rgba(255,255,255,.06)' },
            pointLabels: { color: '#7d95b0', font: { size: 10 } },
          },
        },
      },
    });
    return () => ci.current?.destroy();
  }, [data, activeDevs, activeIndices]);

  const best = [...devScores].sort((a, b) => b.avg - a.avg)[0];

  return (
    <div className="cc" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Encabezado */}
      <div className="cc-h">
        <div><div className="cc-tit">Comparativa de desarrolladores</div><div className="cc-sub">Score 0–100 relativo al mejor del equipo en el período</div></div>
        <div className="leg">
          {devScores.map((ds, i) => (
            <div key={i} className="leg-i"><div className="leg-d" style={{ background: ds.color }} />{ds.name}</div>
          ))}
        </div>
      </div>

      {/* Radar */}
      <div style={{ position: 'relative', height: 220 }}><canvas ref={ref} /></div>

      {/* Tabla de scores */}
      <div style={{ marginTop: 18, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left',   padding: '6px 10px', color: 'var(--t3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--br)' }}>Dev</th>
              {DIMS.map(d => (
                <th key={d} style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--t3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--br)' }}>{d}</th>
              ))}
              <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--t3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--br)' }}>Score</th>
              <th style={{ textAlign: 'left',   padding: '6px 10px', color: 'var(--t3)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--br)' }}>Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            {devScores.map((ds, i) => {
              const isBest = ds.name === best?.name;
              return (
                <tr key={i} style={{ background: isBest ? `${ds.color}08` : 'transparent' }}>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--br)', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: `${ds.color}20`, color: ds.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{inits(ds.name)}</span>
                      <span style={{ fontWeight: 600 }}>{ds.name}</span>
                      {isBest && <span style={{ fontSize: 9, background: `${ds.color}20`, color: ds.color, padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>TOP</span>}
                    </span>
                  </td>
                  {ds.scores.map((score, si) => {
                    const pct = score;
                    const barColor = pct >= 70 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#f87171';
                    return (
                      <td key={si} style={{ padding: '9px 8px', textAlign: 'center', borderBottom: '1px solid var(--br)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontFamily: 'var(--fm)', fontSize: 13, fontWeight: 600, color: barColor }}>{pct}</span>
                          <div style={{ width: 36, height: 3, background: 'var(--bg2)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 2 }} />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: '9px 8px', textAlign: 'center', borderBottom: '1px solid var(--br)' }}>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 15, fontWeight: 700, color: ds.color }}>{ds.avg}</span>
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--br)', color: 'var(--t2)', fontSize: 11, maxWidth: 220 }}>
                    {ds.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
