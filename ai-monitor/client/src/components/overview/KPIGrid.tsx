import type { PeriodData, Developer } from '../../types/dashboard';

function fT(n: number) { return n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n); }
function fC(n: number) { return '$'+n.toFixed(2); }

interface Props { data: PeriodData; activeDevs: Developer[]; activeIndices: number[] }

function Trend({ delta }: { delta: number | null }) {
  if (delta === null || delta === undefined) return null;
  const up = delta >= 0;
  return (
    <span className={`kpi-trend ${up ? 'up' : 'down'}`}>
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

export default function KPIGrid({ data, activeDevs, activeIndices }: Props) {
  const activeDatas = activeIndices.map(i => data.developers[i]);

  const tI = activeDatas.reduce((s, v) => s + v.tokens.input,  0);
  const tO = activeDatas.reduce((s, v) => s + v.tokens.output, 0);
  const tC = activeDatas.reduce((s, v) => s + v.costUSD,       0);
  const tR = activeDatas.reduce((s, v) => s + v.requests,      0);
  const n  = activeDevs.length || 1;

  const topLocal = activeDatas.reduce((top, dev, i) => {
    const t = dev.tokens.input + dev.tokens.output;
    return t > top.t ? { t, i } : top;
  }, { t: 0, i: 0 });
  const topName = activeDevs[topLocal.i]?.name || '—';
  const topIdx  = activeIndices[topLocal.i] ?? 0;

  // Promedio de tendencia de todos los devs activos
  const trends   = data.devTrends ?? [];
  const validT   = activeIndices.map(i => trends[i]?.tokensDelta).filter(v => v !== null && v !== undefined) as number[];
  const validC   = activeIndices.map(i => trends[i]?.costDelta).filter(v => v !== null && v !== undefined)   as number[];
  const avgToken = validT.length ? validT.reduce((a, b) => a + b, 0) / validT.length : null;
  const avgCost  = validC.length ? validC.reduce((a, b) => a + b, 0) / validC.length : null;

  return (
    <div className="kpi-g">
      <div className="kpi">
        <div className="k-lbl">Total Tokens</div>
        <div className="k-val">{fT(tI + tO)}</div>
        <div className="k-sub">{fT(tI)} entrada · {fT(tO)} salida <Trend delta={avgToken} /></div>
        <div className="k-ico">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
      <div className="kpi">
        <div className="k-lbl">Costo Estimado</div>
        <div className="k-val">{fC(tC)}</div>
        <div className="k-sub">{fC(tC / n)} promedio por dev <Trend delta={avgCost} /></div>
        <div className="k-ico">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 6v12M9 8.5c0-1.4 1.3-2 3-2s3 .6 3 2-1.3 2-3 2-3 .6-3 2 1.3 2 3 2 3-.6 3-2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <div className="kpi">
        <div className="k-lbl">Total Requests</div>
        <div className="k-val">{tR}</div>
        <div className="k-sub">{Math.round(tR / n)} promedio por dev <Trend delta={avgToken} /></div>
        <div className="k-ico">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <div className="kpi">
        <div className="k-lbl">Más Activo</div>
        <div className="k-val" style={{ fontSize: 17, fontFamily: 'var(--ff)' }}>{topName}</div>
        <div className="k-sub">{fT(data.developers[topIdx].tokens.input + data.developers[topIdx].tokens.output)} tokens totales</div>
        <div className="k-ico">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
