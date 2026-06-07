import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { PeriodData } from '../../types/dashboard';

const TT = { backgroundColor: '#0c1522', borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, titleColor: '#eef4ff', bodyColor: '#7d95b0', padding: 10 };

interface Props { data: PeriodData }

export default function ModelUsageChart({ data }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ci = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ci.current?.destroy();
    const totals: Record<string, number> = {};
    data.developers.forEach(dev => Object.entries(dev.modelUsage).forEach(([k, v]) => { totals[k] = (totals[k] || 0) + v; }));
    const keys = Object.keys(totals);
    ci.current = new Chart(ref.current, {
      type: 'bar',
      data: { labels: keys, datasets: [{ data: keys.map(k => totals[k]), backgroundColor: ['#818cf8cc', '#fbbf24cc', '#38bdf8cc'], borderRadius: 4, borderSkipped: false }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { ...TT, callbacks: { label: (c: any) => ` ${c.parsed.x} requests` } } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.04)' }, border: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
    return () => { ci.current?.destroy(); ci.current = null; };
  }, [data]);

  return (
    <div className="cc">
      <div className="cc-h"><div><div className="cc-tit">Modelos utilizados</div><div className="cc-sub">Requests por modelo</div></div></div>
      <div style={{ position: 'relative', height: 172 }}><canvas ref={ref} /></div>
    </div>
  );
}
