import { useState, useEffect } from 'react';
import type { DashboardConfig, Developer } from '../../types/dashboard';

interface DevAnalysis {
  name: string;
  color: string;
  productivityScore: number;
  problemSolvingScore: number;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  // métricas crudas
  total?: number;
  activeDays?: number;
  sessionsPerDay?: number;
  consistencyScore?: number;
  avgOutputPerSession?: number;
  totalCost?: number;
  debugRatio?: number;
  taskDiversityScore?: number;
  topTask?: string;
  projects?: number;
}

interface AnalysisResult {
  generatedAt: string;
  isDemo: boolean;
  team: {
    summary: string;
    strengths: string[];
    recommendations: string[];
  };
  developers: DevAnalysis[];
  devMetrics?: DevAnalysis[];
}

interface Props { config: DashboardConfig; devs: Developer[] }

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ position: 'relative', height: 6, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${value}%`, background: color, borderRadius: 4, transition: 'width .6s ease' }} />
    </div>
  );
}

function MetricPill({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 90 }}>
      <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--fm)', color: 'var(--t1)' }}>{value}<span style={{ fontSize: 11, color: 'var(--t2)', marginLeft: 2 }}>{unit}</span></div>
    </div>
  );
}

function DevCard({ dev }: { dev: DevAnalysis }) {
  const c = dev.color || 'var(--a)';
  return (
    <div className="cc" style={{ border: `1px solid ${c}28`, transition: 'border .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: c + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
            <circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-4 3-6 7-6s7 2 7 6"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{dev.name}</div>
          <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 1 }}>Tarea principal: {dev.topTask || '—'} · {dev.projects || 0} proyectos</div>
        </div>
      </div>

      {/* Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Productividad</span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--fm)', color: c }}>{dev.productivityScore}</span>
          </div>
          <ScoreBar value={dev.productivityScore} color={c} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Resolución</span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--fm)', color: c }}>{dev.problemSolvingScore}</span>
          </div>
          <ScoreBar value={dev.problemSolvingScore} color={c} />
        </div>
      </div>

      {/* Métricas rápidas */}
      {dev.total != null && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <MetricPill label="Sesiones" value={dev.total} />
          <MetricPill label="Días activo" value={dev.activeDays ?? '—'} />
          <MetricPill label="Ses/día" value={dev.sessionsPerDay ?? '—'} />
          <MetricPill label="Costo" value={`$${(dev.totalCost ?? 0).toFixed(2)}`} />
          <MetricPill label="% Debug" value={dev.debugRatio ?? 0} unit="%" />
          <MetricPill label="Consistencia" value={dev.consistencyScore ?? 0} unit="%" />
        </div>
      )}

      {/* Análisis IA */}
      {dev.analysis && (
        <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.65, margin: '0 0 14px' }}>{dev.analysis}</p>
      )}

      {/* Fortalezas / Áreas de mejora */}
      {(dev.strengths?.length > 0 || dev.weaknesses?.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {dev.strengths?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: '#34d399', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Fortalezas</div>
              {dev.strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ color: '#34d399', fontSize: 10, marginTop: 2, flexShrink: 0 }}>▲</span>
                  <span style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          {dev.weaknesses?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: '#f87171', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Áreas de mejora</div>
              {dev.weaknesses.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ color: '#f87171', fontSize: 10, marginTop: 2, flexShrink: 0 }}>▼</span>
                  <span style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.5 }}>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recomendación */}
      {dev.recommendation && (
        <div style={{ background: c + '10', border: `1px solid ${c}22`, borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: c, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Recomendación</div>
          <p style={{ fontSize: 12, color: 'var(--t1)', margin: 0, lineHeight: 1.6 }}>{dev.recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default function Insights({ config }: Props) {
  const [result, setResult]   = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const serverUrl = config.serverUrl || 'http://localhost:3001';

  async function fetchAnalysis(force = false) {
    setLoading(true);
    setError('');
    try {
      if (force) {
        await fetch(`${serverUrl}/api/analysis/cache`, { method: 'DELETE', credentials: 'include' });
      }
      const res = await fetch(`${serverUrl}/api/analysis`, { credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();

      // Combinar devMetrics (datos crudos) con developers (análisis IA)
      if (data.devMetrics && data.developers) {
        data.developers = data.developers.map((d: DevAnalysis, i: number) => ({
          ...data.devMetrics[i],
          ...d,
          color: data.devMetrics[i]?.color || d.color,
        }));
      }
      setResult(data);
    } catch (e: any) {
      setError('No se pudo cargar el análisis. Verificá que el servidor esté corriendo.');
    }
    setLoading(false);
  }

  useEffect(() => { fetchAnalysis(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--bg3)', borderTop: '2px solid var(--a)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <span style={{ color: 'var(--t2)', fontSize: 13 }}>Generando análisis IA…</span>
    </div>
  );

  if (error) return (
    <div style={{ color: '#f87171', padding: 32, textAlign: 'center', fontSize: 13 }}>{error}</div>
  );

  if (!result) return null;

  const ts = new Date(result.generatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 2 }}>
            {result.isDemo ? 'Datos demo · ' : ''}Generado: {ts}
            {result.isDemo && (
              <span style={{ marginLeft: 8, color: '#fbbf24', fontSize: 10 }}>· Modo demo</span>
            )}
          </div>
        </div>
        <button
          onClick={() => fetchAnalysis(true)}
          style={{ background: 'var(--bg2)', border: '1px solid var(--br)', borderRadius: 8, padding: '7px 14px', fontSize: 11, color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 4v6h6"/><path d="M19 16v-6h-6"/><path d="M17.5 9A8 8 0 0 0 3.5 6.5M2.5 11a8 8 0 0 0 14 4.5"/>
          </svg>
          Regenerar
        </button>
      </div>

      {/* Team summary */}
      <div className="cc" style={{ marginBottom: 16, borderTop: '2px solid var(--a)', borderRadius: 12 }}>
        <div className="cc-h" style={{ marginBottom: 12 }}>
          <div>
            <div className="cc-tit">Diagnóstico del equipo</div>
            <div className="cc-sub">Análisis IA basado en datos reales de uso</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, margin: '0 0 16px' }}>{result.team.summary}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {result.team.strengths?.length > 0 && (
            <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: '#34d399', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Fortalezas del equipo</div>
              {result.team.strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ color: '#34d399', fontSize: 12, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          {result.team.recommendations?.length > 0 && (
            <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--a)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Recomendaciones</div>
              {result.team.recommendations.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ color: 'var(--a)', fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ranking rápido */}
      {result.developers?.length > 0 && (
        <div className="cc" style={{ marginBottom: 16 }}>
          <div className="cc-h" style={{ marginBottom: 12 }}>
            <div><div className="cc-tit">Ranking — uso efectivo de IA</div><div className="cc-sub">Score combinado: productividad + capacidad de resolución</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...result.developers]
              .sort((a, b) => ((b.productivityScore + b.problemSolvingScore) / 2) - ((a.productivityScore + a.problemSolvingScore) / 2))
              .map((d, i) => {
                const avg = Math.round((d.productivityScore + d.problemSolvingScore) / 2);
                const medal = ['🥇','🥈','🥉'][i] || `#${i+1}`;
                return (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16, width: 24, flexShrink: 0, textAlign: 'center' }}>{medal}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 500, minWidth: 80 }}>{d.name}</span>
                      <div style={{ flex: 1, position: 'relative', height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${avg}%`, background: d.color, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'var(--fm)', color: d.color, fontWeight: 700, width: 32, textAlign: 'right' }}>{avg}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Cards individuales */}
      {result.developers?.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 10 }}>Análisis individual</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
            {result.developers.map(d => <DevCard key={d.name} dev={d} />)}
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
