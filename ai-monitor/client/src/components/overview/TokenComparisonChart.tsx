import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { PeriodData, Developer } from '../../types/dashboard';

const TT = { backgroundColor: '#0c1522', borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, titleColor: '#eef4ff', bodyColor: '#7d95b0', padding: 10 };
function fT(n: number) { return n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n); }

interface Props { data: PeriodData; activeDevs: Developer[]; activeIndices: number[] }

export default function TokenComparisonChart({ data, activeDevs, activeIndices }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ci  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ci.current?.destroy();
    const names  = activeDevs.map(d => d.name);
    const colors = activeDevs.map(d => d.color);
    ci.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [
          { label: 'Input',  data: activeIndices.map(i => data.developers[i].tokens.input),  backgroundColor: colors.map(c => c + 'cc'), borderRadius: 0, stack: 't' },
          { label: 'Output', data: activeIndices.map(i => data.developers[i].tokens.output), backgroundColor: colors.map(c => c + '44'), borderRadius: 4, stack: 't' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { ...TT, callbacks: { label: (c: any) => ` ${c.dataset.label}: ${fT(c.parsed.y)}` } } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { stacked: true, grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { font: { size: 10 }, callback: (v: any) => fT(v) } },
        },
      },
    });
    return () => { ci.current?.destroy(); ci.current = null; };
  }, [data, activeDevs, activeIndices]);

  return (
    <div className="cc">
      <div className="cc-h">
        <div><div className="cc-tit">Input vs Output</div><div className="cc-sub">Tokens por desarrollador</div></div>
        <div className="leg">
          <div className="leg-i"><div className="leg-d" style={{ background: '#818cf8', opacity: 0.9 }} />Input</div>
          <div className="leg-i"><div className="leg-d" style={{ background: '#818cf8', opacity: 0.4 }} />Output</div>
        </div>
      </div>
      <div style={{ position: 'relative', height: 172 }}><canvas ref={ref} /></div>
    </div>
  );
}
