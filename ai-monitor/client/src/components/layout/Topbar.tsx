import type { Period, View } from '../../types/dashboard';

const PALS = [
  { k: 'green',  color: '#22c55e' },
  { k: 'indigo', color: '#6366f1' },
  { k: 'blue',   color: '#38bdf8' },
  { k: 'amber',  color: '#f59e0b' },
  { k: 'rose',   color: '#f43f5e' },
] as const;

const VIEW_LABELS: Record<View, string> = {
  overview:     'Monitoreo de Agentes IA',
  developers:   'Desarrolladores',
  activity:     'Actividad del equipo',
  admin:        'Gestión de Agentes',
};

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoy',
  week:  'Esta semana',
  month: 'Este mes',
};

interface Props {
  view: View;
  period: Period;
  onPeriod: (p: Period) => void;
  palette: string;
  onPalette: (p: 'green' | 'indigo' | 'blue' | 'amber' | 'rose') => void;
  teamName: string;
}

export default function Topbar({ view, period, onPeriod, palette, onPalette, teamName }: Props) {
  const title = teamName || VIEW_LABELS[view];
  const sub = PERIOD_LABELS[period];

  return (
    <div className="topbar">
      <div className="tb-t">
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      <div className="ptabs">
        {(['today', 'week', 'month'] as Period[]).map(p => (
          <button key={p} className={`pt${period === p ? ' on' : ''}`} onClick={() => onPeriod(p)}>
            {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
          </button>
        ))}
      </div>
      <div className="pdots">
        {PALS.map(({ k, color }) => (
          <div
            key={k}
            className={`pdot${palette === k ? ' on' : ''}`}
            style={{ background: color }}
            onClick={() => onPalette(k)}
            title={k}
          />
        ))}
      </div>
    </div>
  );
}
