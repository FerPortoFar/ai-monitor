import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { MonthHistory, Developer } from '../../types/dashboard';

const TT = { backgroundColor: '#0c1522', borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, titleColor: '#eef4ff', bodyColor: '#7d95b0', padding: 10 };

interface Props { history: MonthHistory; activeDevs: Developer[] }

export default function CostHistoryChart({ history, activeDevs }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ci  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ci.current?.destroy();

    const datasets = (history.devCosts || []).map((costs, i) => {
      const dev = activeDevs[i];
      const c   = dev?.color || '#818cf8';
      return {
        label:           dev?.name || `Dev ${i + 1}`,
        data:            costs,
        backgroundColor: c + '88',
        borderColor:     c,
        borderWidth:     1,
        borderRadius:    3,
        borderSkipped:   false,
      };
    });

    ci.current = new Chart(ref.current, {
      type: 'bar',
      data: { labels: history.months, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...TT, callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { font: { size: 10 }, callback: (v: any) => `$${v}` } },
        },
      },
    });

    return () => ci.current?.destroy();
  }, [history, activeDevs]);

  return (
    <div className="cc">
      <div className="cc-h">
        <div><div className="cc-tit">Historial de costos — 6 meses</div><div className="cc-sub">Costo estimado USD por desarrollador</div></div>
        <div className="leg">
          {activeDevs.map((d, i) => (
            <div key={i} className="leg-i"><div className="leg-d" style={{ background: d?.color }} />{d?.name}</div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', height: 180 }}><canvas ref={ref} /></div>
    </div>
  );
}
