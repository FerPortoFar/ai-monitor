import type { PeriodData, DashboardConfig, Developer, MonthHistory } from '../../types/dashboard';
import KPIGrid from './KPIGrid';
import DeveloperCards from './DeveloperCards';
import ActivityChart from './ActivityChart';
import TaskTypeChart from './TaskTypeChart';
import TokenComparisonChart from './TokenComparisonChart';
import ModelUsageChart from './ModelUsageChart';
import CostHistoryChart from './CostHistoryChart';
import RadarChart from './RadarChart';
import ProjectsTable from './ProjectsTable';

interface Props {
  data: PeriodData | null;
  history: MonthHistory | null;
  period: string;
  config: DashboardConfig;
  devs: Developer[];
  loading: boolean;
}

export default function Overview({ data, history, period, config, devs, loading }: Props) {
  if (loading || !data) return <div style={{ color: 'var(--t2)', padding: '40px 0' }}>Cargando…</div>;

  const active     = (data.configuredIndices ?? devs.map((_, i) => i)).filter(i => i < devs.length);
  const activeDevs = active.map(i => devs[i]);

  return (
    <>
      <KPIGrid data={data} activeDevs={activeDevs} activeIndices={active} />
      <DeveloperCards data={data} activeDevs={activeDevs} activeIndices={active} period={period} />
      <div className="crow">
        <ActivityChart data={data} activeDevs={activeDevs} activeIndices={active} />
        <TaskTypeChart data={data} />
      </div>
      <div className="crow2">
        <TokenComparisonChart data={data} activeDevs={activeDevs} activeIndices={active} />
        <ModelUsageChart data={data} />
      </div>
      <div className="crow">
        {history && <CostHistoryChart history={history} activeDevs={activeDevs} />}
        <RadarChart data={data} activeDevs={activeDevs} activeIndices={active} />
      </div>
      <ProjectsTable data={data} activeDevs={activeDevs} activeIndices={active} />
    </>
  );
}
