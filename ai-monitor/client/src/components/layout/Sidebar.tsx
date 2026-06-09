import type { View } from '../../types/dashboard';

interface Props {
  view: View;
  onView: (v: View) => void;
  onSettings: () => void;
  onHelp: () => void;
  onLogout: () => void;
  user: string;
}

function inits(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export default function Sidebar({ view, onView, onSettings, onHelp, onLogout, user }: Props) {
  return (
    <div className="sb">
      <div className="sb-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3.5"/>
          <line x1="12" y1="8" x2="12" y2="4.5"/><line x1="12" y1="16" x2="12" y2="19.5"/>
          <line x1="8" y1="12" x2="4.5" y2="12"/><line x1="16" y1="12" x2="19.5" y2="12"/>
          <line x1="9.5" y1="9.5" x2="7" y2="7"/><line x1="14.5" y1="14.5" x2="17" y2="17"/>
          <line x1="9.5" y1="14.5" x2="7" y2="17"/><line x1="14.5" y1="9.5" x2="17" y2="7"/>
        </svg>
      </div>
      <div className="sb-nav">
        <button className={`ib${view === 'overview' ? ' on' : ''}`} title="Overview" onClick={() => onView('overview')}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
            <rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/>
          </svg>
        </button>
        <button className={`ib${view === 'developers' ? ' on' : ''}`} title="Desarrolladores" onClick={() => onView('developers')}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="7" cy="7" r="3"/><path d="M2 17c0-3 2.24-5 5-5s5 2 5 5"/>
            <circle cx="14.5" cy="7.5" r="2.5"/><path d="M17 17c0-2.5-1.3-4-2.5-4"/>
          </svg>
        </button>
        <button className={`ib${view === 'activity' ? ' on' : ''}`} title="Actividad" onClick={() => onView('activity')}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,15 6,9 9,12 13,7 18,11"/>
          </svg>
        </button>
        <button className={`ib${view === 'insights' ? ' on' : ''}`} title="Análisis IA" onClick={() => onView('insights')}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2z"/>
            <path d="M10 6v4l3 3"/>
            <circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
        </button>
        <button className={`ib${view === 'admin' ? ' on' : ''}`} title="Gestión de desarrolladores" onClick={() => onView('admin')}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="8" cy="7" r="3"/><path d="M2 17c0-3 2.7-5 6-5s6 2 6 5"/>
            <line x1="14" y1="8" x2="18" y2="8"/><line x1="16" y1="6" x2="16" y2="10"/>
          </svg>
        </button>
      </div>
      <div className="sb-bot">
        <button className="ib" title="Ayuda / Manual de usuario" onClick={onHelp}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="10" cy="10" r="8"/>
            <path d="M7.5 7.5a2.5 2.5 0 0 1 4.87.83c0 1.67-2.5 2.5-2.5 2.5"/>
            <circle cx="10" cy="14.5" r=".6" fill="currentColor" stroke="none"/>
          </svg>
        </button>
        <button className="ib" title="Configuración" onClick={onSettings}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="10" cy="10" r="2.5"/>
            <path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.1 4.1l1.8 1.8M14.1 14.1l1.8 1.8M4.1 15.9l1.8-1.8M14.1 5.9l1.8-1.8"/>
          </svg>
        </button>
        <button className="ib" title="Cerrar sesión" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 3h4v14h-4"/><polyline points="8 14 13 10 8 6"/><line x1="13" y1="10" x2="3" y2="10"/>
          </svg>
        </button>
        <div className="uav" title={user}>{inits(user)}</div>
        <div title="Creado por Fernando Ribeiro" style={{ fontSize: 9, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.3, padding: '4px 0', letterSpacing: '.3px' }}>FR</div>
      </div>
    </div>
  );
}
