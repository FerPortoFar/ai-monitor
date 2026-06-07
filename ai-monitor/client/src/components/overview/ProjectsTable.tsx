import type { PeriodData, Developer } from '../../types/dashboard';
import DataTable from '../shared/DataTable';

function fT(n: number) { return n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n); }
function fC(n: number) { return '$'+n.toFixed(2); }

interface ProjRow {
  devName: string; devColor: string; displayName: string;
  tokensOut: number; tokensIn: number; costUSD: number;
  requests: number; topModel: string; lastWorked: string;
}

interface Props { data: PeriodData; activeDevs: Developer[]; activeIndices: number[] }

export default function ProjectsTable({ data, activeDevs, activeIndices }: Props) {
  const rows: ProjRow[] = [];

  for (let li = 0; li < activeIndices.length; li++) {
    const di   = activeIndices[li];
    const dev  = data.developers[di];
    const info = activeDevs[li];
    for (const proj of Object.values(dev.projects || {})) {
      rows.push({
        devName:     info?.name  || `Dev ${di + 1}`,
        devColor:    info?.color || '#818cf8',
        displayName: proj.displayName,
        tokensOut:   proj.tokens.output,
        tokensIn:    proj.tokens.input,
        costUSD:     proj.costUSD || 0,
        requests:    proj.requests,
        topModel:    Object.entries(proj.modelUsage || {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—',
        lastWorked:  proj.lastWorked || '',
      });
    }
  }

  if (rows.length === 0) return null;
  rows.sort((a, b) => b.tokensOut - a.tokensOut);

  return (
    <DataTable
      title="Proyectos del equipo"
      subtitle={`${rows.length} proyectos en total`}
      storageKey="overview-projects"
      data={rows}
      columns={[
        { key: 'devName',     label: 'Dev',          sortVal: r => r.devName,
          render: r => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: r.devColor, display: 'inline-block' }} />{r.devName}</span>,
          printVal: r => r.devName },
        { key: 'displayName', label: 'Proyecto',     sortVal: r => r.displayName,
          render: r => <span style={{ fontWeight: 500 }}>{r.displayName}</span>, printVal: r => r.displayName },
        { key: 'tokensOut',   label: 'Output',       align: 'right', sortVal: r => r.tokensOut,
          render: r => <span style={{ fontFamily: 'var(--fm)', color: r.devColor }}>{fT(r.tokensOut)}</span>, printVal: r => fT(r.tokensOut) },
        { key: 'tokensIn',    label: 'Input',        align: 'right', sortVal: r => r.tokensIn,   hidden: true,
          render: r => <span style={{ fontFamily: 'var(--fm)' }}>{fT(r.tokensIn)}</span>, printVal: r => fT(r.tokensIn) },
        { key: 'costUSD',     label: 'Costo',        align: 'right', sortVal: r => r.costUSD,
          render: r => <span style={{ fontFamily: 'var(--fm)', color: 'var(--a)' }}>{fC(r.costUSD)}</span>, printVal: r => fC(r.costUSD) },
        { key: 'requests',    label: 'Requests',     align: 'right', sortVal: r => r.requests,
          render: r => <span style={{ fontFamily: 'var(--fm)' }}>{r.requests}</span>, printVal: r => String(r.requests) },
        { key: 'topModel',    label: 'Modelo',       sortVal: r => r.topModel,
          render: r => <span style={{ color: 'var(--t2)', fontSize: 12 }}>{r.topModel}</span>, printVal: r => r.topModel },
        { key: 'lastWorked',  label: 'Último uso',   sortVal: r => r.lastWorked,
          render: r => <span style={{ color: 'var(--t2)', fontSize: 12 }}>{r.lastWorked ? new Date(r.lastWorked + 'T12:00:00').toLocaleDateString('es-AR') : '—'}</span>,
          printVal: r => r.lastWorked || '—' },
      ]}
    />
  );
}
