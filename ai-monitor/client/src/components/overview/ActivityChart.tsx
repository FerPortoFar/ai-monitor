import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { PeriodData, Developer } from '../../types/dashboard';

const TT = { backgroundColor: '#0c1522', borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, titleColor: '#eef4ff', bodyColor: '#7d95b0', padding: 10 };
function fT(n: number) { return n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n); }

interface Props { data: PeriodData; activeDevs: Developer[]; activeIndices: number[] }

export default function ActivityChart({ data, activeDevs, activeIndices }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ci  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ci.current?.destroy();
    ci.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: activeIndices.map((di, li) => {
          const dev  = data.developers[di];
          const info = activeDevs[li];
          const c    = info?.color || '#818cf8';
          const name = info?.name  || `Dev ${di + 1}`;
          return {
            label: name, data: dev.activity,
            borderColor: c, backgroundColor: c + '12',
            borderWidth: 2, tension: 0.4, fill: true,
            pointRadius: 2, pointHoverRadius: 5,
            pointBackgroundColor: c, pointBorderWidth: 0,
          };
        }),
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { ...TT, callbacks: { label: (c: any) => ` ${c.dataset.label}: ${fT(c.parsed.y)}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { font: { size: 10 }, callback: (v: any) => fT(v) } },
        },
      },
    });
    return () => { ci.current?.destroy(); ci.current = null; };
  }, [data, activeDevs, activeIndices]);

  return (
    <div className="cc">
      <div className="cc-h">
        <div>
          <div className="cc-tit">Actividad en el tiempo</div>
          <div className="cc-sub">Tokens consumidos por período</div>
        </div>
        <div className="leg">
          {activeDevs.map((d, i) => (
            <div key={i} className="leg-i">
              <div className="leg-d" style={{ background: d.color }} />
              {d.name}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', height: 172 }}>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
