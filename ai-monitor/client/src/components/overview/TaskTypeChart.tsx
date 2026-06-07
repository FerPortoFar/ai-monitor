import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { PeriodData } from '../../types/dashboard';

const TK_COLS = ['#818cf8', '#fbbf24', '#38bdf8', '#34d399', '#f87171'];
const TT = { backgroundColor: '#0c1522', borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, titleColor: '#eef4ff', bodyColor: '#7d95b0', padding: 10 };

interface Props { data: PeriodData }

export default function TaskTypeChart({ data }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ci = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ci.current?.destroy();
    const totals: Record<string, number> = {};
    data.developers.forEach(dev => Object.entries(dev.tasks).forEach(([k, v]) => { totals[k] = (totals[k] || 0) + v; }));
    const keys = Object.keys(totals);
    ci.current = new Chart(ref.current, {
      type: 'doughnut',
      data: { labels: keys, datasets: [{ data: keys.map(k => totals[k]), backgroundColor: TK_COLS, borderWidth: 0, hoverOffset: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, boxHeight: 10, padding: 10, color: '#7d95b0' } },
          tooltip: { ...TT }
        }
      }
    });
    return () => { ci.current?.destroy(); ci.current = null; };
  }, [data]);

  return (
    <div className="cc">
      <div className="cc-h"><div><div className="cc-tit">Tipos de tarea</div><div className="cc-sub">Distribución total del equipo</div></div></div>
      <div style={{ position: 'relative', height: 172 }}><canvas ref={ref} /></div>
    </div>
  );
}
