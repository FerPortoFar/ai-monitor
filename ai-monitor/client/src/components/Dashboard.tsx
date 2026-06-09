import { useState, useEffect } from 'react';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Overview from './overview/Overview';
import Developers from './developers/Developers';
import Activity from './activity/Activity';
import DevelopersAdmin from './admin/DevelopersAdmin';
import Insights from './insights/Insights';
import SettingsModal from './shared/SettingsModal';
import HelpModal from './shared/HelpModal';
import { useConfig } from '../hooks/useConfig';
import { useDashboard } from '../hooks/useDashboard';
import type { View, Period } from '../types/dashboard';

interface Props { user: string; onLogout: () => void }

export default function Dashboard({ user, onLogout }: Props) {
  const [view, setView]           = useState<View>('overview');
  const [period, setPeriod]       = useState<Period>('week');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen,     setHelpOpen]     = useState(false);
  const { config, save }          = useConfig();
  const { data, sessions, heatmap, devs, history, loading } = useDashboard(period, user);

  useEffect(() => {
    document.body.setAttribute('data-pal', config.palette || 'green');
  }, [config.palette]);

  return (
    <div className="app-wrap">
      <Sidebar view={view} onView={setView} onSettings={() => setSettingsOpen(true)} onHelp={() => setHelpOpen(true)} user={user} onLogout={onLogout} />
      <div className="main">
        <Topbar
          view={view}
          period={period}
          onPeriod={setPeriod}
          palette={config.palette}
          onPalette={p => save({ palette: p })}
          teamName={config.team}
        />
        <div className="content">
          {view === 'overview'    && <Overview data={data} history={history} period={period} config={config} devs={devs} loading={loading} />}
          {view === 'developers'  && <Developers data={data} sessions={sessions} config={config} devs={devs} loading={loading} />}
          {view === 'activity'    && <Activity data={data} sessions={sessions} heatmap={heatmap} config={config} devs={devs} loading={loading} />}
          {view === 'admin'       && <DevelopersAdmin />}
          {view === 'insights'   && <Insights config={config} devs={devs} isDemo={user === 'Demo'} />}
        </div>
      </div>
      {settingsOpen && (
        <SettingsModal config={config} devs={devs} onSave={save} onClose={() => setSettingsOpen(false)} />
      )}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
