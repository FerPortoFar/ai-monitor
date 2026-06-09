import type { PeriodData, Developer } from '../../types/dashboard';

const RC = ['#fbbf24', '#94a3b8', '#cd8c52']; // 1°oro 2°plata 3°bronce
function rankColor(rank: number) { return RC[rank - 1] || '#3d5268'; }

function fT(n: number) { return n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n); }
function fC(n: number) { return '$'+n.toFixed(2); }
function inits(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function projectedMonthlyCost(costUSD: number, period: string): number {
  if (period === 'today') return costUSD * 22;
  if (period === 'week')  return costUSD * 4.33;
  return costUSD;
}

interface Props { data: PeriodData; activeDevs: Developer[]; activeIndices: number[]; period: string }

export default function DeveloperCards({ data, activeDevs, activeIndices, period }: Props) {
  const thresholds: Record<string, number> = (() => {
    try { return JSON.parse(localStorage.getItem('aim-thresholds') || '{}'); } catch { return {}; }
  })();

  const ranked = activeIndices
    .map((di, li) => ({ li, di, total: data.developers[di].tokens.input + data.developers[di].tokens.output }))
    .sort((a, b) => b.total - a.total);
  const rankOf = (li: number) => ranked.findIndex(r => r.li === li) + 1;

  const efficiencies = activeIndices.map(di => {
    const dev = data.developers[di];
    return dev.requests > 0 ? Math.round(dev.tokens.output / dev.requests) : 0;
  });
  const maxEff = Math.max(...efficiencies, 1);

  return (
    <div className="dev-g">
      {activeIndices.map((di, li) => {
        const dev  = data.developers[di];
        const info = activeDevs[li];
        const c    = info?.color || '#818cf8';
        const name = info?.name  || `Dev ${di + 1}`;
        const rank = rankOf(li);
        const total = dev.tokens.input + dev.tokens.output;
        const inPct = (dev.tokens.input / (total || 1) * 100).toFixed(1);
        const topTask = Object.entries(dev.tasks).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

        const trend = data.devTrends?.[di];
        const delta = trend?.tokensDelta ?? null;

        const eff    = efficiencies[li];
        const effPct = Math.min(100, Math.round((eff / maxEff) * 100));

        const projected    = projectedMonthlyCost(dev.costUSD, period);
        const threshold    = thresholds[name];
        const overBudget   = threshold != null && projected > threshold;
        const nearBudget   = threshold != null && !overBudget && projected > threshold * 0.8;

        const act = dev.activity;
        const mn = Math.min(...act), mx = Math.max(...act), rng = mx - mn || 1;
        const sp = act.map((v, j) =>
          `${j === 0 ? 'M' : 'L'}${(j / (act.length - 1) * 100).toFixed(1)},${(26 - ((v - mn) / rng * 22)).toFixed(1)}`
        ).join(' ');

        return (
          <div key={di} className="dc">
            <div className="dh">
              <div className="dav" style={{ background: `${c}18`, color: c }}>{inits(name)}</div>
              <div className="dinf">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {name}
                  {overBudget  && <span className="budget-badge over"  title={`Proyección mensual: ${fC(projected)} / Límite: ${fC(threshold)}`}>⚠ Budget</span>}
                  {nearBudget  && <span className="budget-badge near"  title={`Proyección mensual: ${fC(projected)} / Límite: ${fC(threshold)}`}>~ Budget</span>}
                </h3>
                <p>
                  {dev.requests} req · {fC(dev.costUSD)}
                  {delta !== null && (
                    <span className={`dc-trend ${delta >= 0 ? 'up' : 'down'}`}>
                      {' '}{delta >= 0 ? '▲' : '▼'}{Math.abs(delta).toFixed(1)}%
                    </span>
                  )}
                </p>
              </div>
              <div className="drank" style={{ background: `${rankColor(rank)}18`, color: rankColor(rank) }}>#{rank}</div>
            </div>

            <div className="tbar">
              <div className="tbar-lb">
                <span>↑ {fT(dev.tokens.input)} in</span>
                <span>↓ {fT(dev.tokens.output)} out</span>
              </div>
              <div className="ttrack">
                <div style={{ width: `${inPct}%`, background: c, height: '100%' }} />
                <div style={{ width: `${(100 - parseFloat(inPct)).toFixed(1)}%`, background: c, opacity: 0.3, height: '100%' }} />
              </div>
            </div>

            {/* Eficiencia */}
            <div className="eff-row">
              <span className="eff-lbl">Eficiencia</span>
              <div className="eff-track">
                <div className="eff-bar" style={{ width: `${effPct}%`, background: c }} />
              </div>
              <span className="eff-val" style={{ color: c }}>{fT(eff)}<span style={{ fontSize: 9, color: 'var(--t3)' }}> tok/req</span></span>
            </div>

            <div className="ds-g">
              <div><div className="ds-l">Tokens</div><div className="ds-v" style={{ color: c }}>{fT(total)}</div></div>
              <div><div className="ds-l">Costo</div><div className="ds-v">{fC(dev.costUSD)}</div></div>
              <div><div className="ds-l">Tarea top</div><div className="ds-v" style={{ fontSize: 13, fontFamily: 'var(--ff)' }}>{topTask}</div></div>
              <div><div className="ds-l">Requests</div><div className="ds-v">{dev.requests}</div></div>
            </div>
            <svg viewBox="0 0 100 28" preserveAspectRatio="none" width="100%" height="28" style={{ overflow: 'visible' }}>
              <path d={`${sp} L100,28 L0,28 Z`} fill={c} opacity={0.08} />
              <path d={sp} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
