import { useState, useEffect } from 'react';
import type { Agent } from '../../types/dashboard';
import { DEV_PALETTE } from '../../types/dashboard';

function inits(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase() || '??';
}

function fDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  } catch { return iso; }
}

function agentStatus(a: Agent): { label: string; cls: string; title: string } {
  if (!a.hasData || !a.lastSeen) return { label: 'Sin datos', cls: 'empty', title: 'El agente nunca reportó' };
  const diffMin = (Date.now() - new Date(a.lastSeen).getTime()) / 60000;
  if (diffMin < 10) return { label: 'En línea', cls: 'ok', title: `Último reporte hace ${Math.round(diffMin)}m` };
  if (diffMin < 60) return { label: `Hace ${Math.round(diffMin)}m`, cls: 'warn', title: 'Reporte reciente' };
  const h = new Date().getHours();
  if (diffMin > 120 && h >= 8 && h <= 20) return { label: 'Offline', cls: 'err', title: `Sin reporte en ${Math.round(diffMin / 60)}h (horario laboral)` };
  return { label: `Hace ${Math.round(diffMin / 60)}h`, cls: 'warn', title: 'Fuera de horario laboral o agente pausado' };
}

interface ModalState { open: boolean; token: string; alias: string; color: string }
const EMPTY_MODAL: ModalState = { open: false, token: '', alias: '', color: DEV_PALETTE[0] };

export default function DevelopersAdmin() {
  const [agents, setAgents]   = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [modal, setModal]     = useState<ModalState>(EMPTY_MODAL);
  const [saving, setSaving]   = useState(false);
  const [fieldErr, setFieldErr] = useState('');

  function loadAgents() {
    setLoading(true);
    fetch('/api/agents', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setAgents(data); setLoading(false); })
      .catch(() => { setError('No se pudieron cargar los agentes'); setLoading(false); });
  }

  useEffect(() => { loadAgents(); }, []);

  function openEdit(a: Agent) {
    setFieldErr('');
    setModal({ open: true, token: a.token, alias: a.alias, color: a.color });
  }

  function closeModal() { setModal(EMPTY_MODAL); setFieldErr(''); }

  async function handleDelete(token: string, alias: string) {
    if (!window.confirm(`¿Eliminar al agente "${alias}"? Se borrarán también sus stats.`)) return;
    try {
      const res = await fetch(`/api/agents/${token}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      setAgents(await res.json());
    } catch {
      setError('Error al eliminar el agente.');
    }
  }

  async function handleSave() {
    if (!modal.alias.trim()) { setFieldErr('El alias es requerido'); return; }
    setSaving(true);
    setFieldErr('');
    try {
      const res = await fetch(`/api/agents/${modal.token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ alias: modal.alias.trim(), color: modal.color }),
      });
      if (!res.ok) { const d = await res.json(); setFieldErr(d.error || 'Error al guardar'); return; }
      setAgents(await res.json());
      closeModal();
    } catch {
      setFieldErr('Error de conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  }

  const serverUrl = window.location.origin;

  if (loading) return <div className="adm-loading">Cargando...</div>;

  return (
    <div className="adm-wrap">
      <div className="adm-header">
        <div>
          <h2>Gestión de agentes</h2>
          <p>Agentes que reportan automáticamente al servidor.</p>
        </div>
      </div>

      {error && <div className="adm-err">{error}</div>}

      {agents.length === 0 ? (
        <div className="adm-empty">Ningún agente ha reportado aún. Instalá el agente en cada equipo.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Alias</th>
                <th>Usuario</th>
                <th>Último reporte</th>
                <th style={{ width: 120 }}>Estado</th>
                <th style={{ width: 100 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.token}>
                  <td>
                    <div className="adm-av" style={{ background: `${a.color}18`, color: a.color }}>
                      {inits(a.alias)}
                    </div>
                  </td>
                  <td>
                    <span className="adm-dev-name">{a.alias}</span>
                    <span style={{ fontSize: 10, color: 'var(--t3)', display: 'block', fontFamily: 'var(--fm)' }}>
                      {a.token.slice(0, 8)}…
                    </span>
                  </td>
                  <td>
                    <span className="adm-path">{a.machineUser || <span style={{ color: 'var(--t3)' }}>—</span>}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--t2)' }}>
                      {fDate(a.lastSeen)}
                    </span>
                  </td>
                  <td>
                    {(() => { const s = agentStatus(a); return <div className={`adm-badge ${s.cls}`} title={s.title}>{s.label}</div>; })()}
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-btn-edit" onClick={() => openEdit(a)} title="Editar alias">
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2.5l3 3L6 17H3v-3L14.5 2.5z"/>
                        </svg>
                      </button>
                      <button className="adm-btn-del" onClick={() => handleDelete(a.token, a.alias)} title="Eliminar">
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 17 6"/><path d="M8 6V4h4v2"/><path d="M5 6l1 11h8l1-11"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-info">
        <strong>¿Cómo instalar el agente?</strong>
        <p>En el equipo de cada desarrollador, ejecutar desde la carpeta <code>ai-monitor-agent/</code>:</p>
        <code style={{ display: 'block', marginBottom: 8 }}>node agent.js</code>
        <p>Para instalarlo como tarea automática (se inicia al login):</p>
        <code style={{ display: 'block', marginBottom: 8 }}>node install-task.js</code>
        <p>El agente se conecta a:</p>
        <code style={{ display: 'block' }}>{serverUrl}</code>
        <p style={{ marginTop: 8, color: 'var(--t3)', fontSize: 11 }}>
          Si el servidor tiene otra URL, editá <code>agent.config.json</code> en el equipo del desarrollador.
        </p>
      </div>

      {modal.open && (
        <div className="ov open" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div className="mh">
              <h3>Editar agente</h3>
              <button className="mx" onClick={closeModal}>✕</button>
            </div>

            {fieldErr && <div className="adm-err" style={{ margin: '0 0 12px' }}>{fieldErr}</div>}

            <div className="ms">
              <h4>Alias (nombre en el dashboard)</h4>
              <input
                className="sinp"
                type="text"
                value={modal.alias}
                placeholder="Ej: Fernando"
                autoFocus
                onChange={e => setModal(m => ({ ...m, alias: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>

            <div className="ms">
              <h4>Color</h4>
              <div className="adm-colors">
                {DEV_PALETTE.map(c => (
                  <button
                    key={c}
                    className={`adm-color-dot${modal.color === c ? ' on' : ''}`}
                    style={{ background: c }}
                    onClick={() => setModal(m => ({ ...m, color: c }))}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="adm-btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="bsave" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
