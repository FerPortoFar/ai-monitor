import { useState, useEffect } from 'react';
import type { DashboardConfig, Developer } from '../../types/dashboard';

interface ModelPrice { label: string; in: number; out: number }
type PricesMap = Record<string, ModelPrice>;

const PALS = [
  { k: 'green',  n: 'Verde',  c: '#22c55e', bg: '#052e16' },
  { k: 'indigo', n: 'Índigo', c: '#6366f1', bg: '#1e1b4b' },
  { k: 'blue',   n: 'Azul',   c: '#38bdf8', bg: '#082032' },
  { k: 'amber',  n: 'Ámbar',  c: '#f59e0b', bg: '#2a1800' },
  { k: 'rose',   n: 'Rosa',   c: '#f43f5e', bg: '#2c0514' },
] as const;

const DC = ['#818cf8', '#fbbf24', '#38bdf8'];

function inits(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase() || '??';
}

interface Props {
  config: DashboardConfig;
  devs?: Developer[];
  onSave: (updates: Partial<DashboardConfig>) => void;
  onClose: () => void;
}

export default function SettingsModal({ config, devs = [], onSave, onClose }: Props) {
  const [team, setTeam]           = useState(config.team);
  const [model, setModel]         = useState(config.model);
  const [thresholds, setThresholds] = useState<Record<string, string>>(() => {
    try {
      const t = JSON.parse(localStorage.getItem('aim-thresholds') || '{}') as Record<string, number>;
      return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, String(v)]));
    } catch { return {}; }
  });
  const [palette, setPalette]     = useState(config.palette);
  const [serverUrl, setServerUrl] = useState(config.serverUrl || window.location.origin);
  const [prices, setPrices]       = useState<PricesMap>({});
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceMsg, setPriceMsg]   = useState('');

  useEffect(() => {
    fetch('/api/prices', { credentials: 'include' })
      .then(r => r.json())
      .then(setPrices)
      .catch(() => {});
  }, []);

  function updatePrice(modelId: string, field: 'in' | 'out', value: string) {
    setPrices(prev => ({
      ...prev,
      [modelId]: { ...prev[modelId], [field]: parseFloat(value) || 0 },
    }));
  }

  async function savePrices() {
    setPriceSaving(true);
    setPriceMsg('');
    try {
      const res = await fetch('/api/prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prices),
      });
      if (res.ok) setPriceMsg('Precios guardados.');
      else setPriceMsg('Error al guardar.');
    } catch {
      setPriceMsg('Error de conexión.');
    } finally {
      setPriceSaving(false);
      setTimeout(() => setPriceMsg(''), 3000);
    }
  }

  function handleSave() {
    const parsed: Record<string, number> = {};
    for (const [k, v] of Object.entries(thresholds)) {
      const n = parseFloat(v);
      if (!isNaN(n) && n > 0) parsed[k] = n;
    }
    localStorage.setItem('aim-thresholds', JSON.stringify(parsed));
    onSave({ team, model, palette, serverUrl });
    onClose();
  }

  return (
    <div className="ov open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="mh">
          <h3>Configuración</h3>
          <button className="mx" onClick={onClose}>✕</button>
        </div>

        <div className="ms">
          <h4>Nombre del equipo / sistema</h4>
          <input className="sinp" type="text" value={team} placeholder="Ej: Equipo de Producto" onChange={e => setTeam(e.target.value)} />
        </div>

        <div className="ms">
          <h4>Modelo principal de IA</h4>
          <input className="sinp" type="text" value={model} placeholder="Ej: Claude 3.5 Sonnet" onChange={e => setModel(e.target.value)} />
        </div>

        <div className="ms">
          <h4>Paleta de color</h4>
          <div className="pal-g">
            {PALS.map(p => (
              <div
                key={p.k}
                className={`po${palette === p.k ? ' on' : ''}`}
                style={{ background: p.bg, color: p.c }}
                onClick={() => setPalette(p.k)}
              >
                {p.n}
              </div>
            ))}
          </div>
        </div>

        <div className="ms">
          <h4>URL del servidor (para configurar agentes)</h4>
          <input className="sinp" type="text" value={serverUrl} placeholder="http://servidor:3001" onChange={e => setServerUrl(e.target.value)} />
          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 5 }}>
            Copiá esta URL en <code style={{ fontFamily: 'var(--fm)', background: 'var(--bg2)', padding: '1px 4px', borderRadius: 3 }}>agent.config.json</code> de cada desarrollador.
          </p>
        </div>

        {Object.keys(prices).length > 0 && (
          <div className="ms">
            <h4>Precios por modelo <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400 }}>(USD / 1M tokens)</span></h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px 8px 4px 0', color: 'var(--t3)', fontWeight: 500 }}>Modelo</th>
                  <th style={{ textAlign: 'right', padding: '4px 4px', color: 'var(--t3)', fontWeight: 500 }}>Input $</th>
                  <th style={{ textAlign: 'right', padding: '4px 0 4px 4px', color: 'var(--t3)', fontWeight: 500 }}>Output $</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(prices).map(([id, p]) => (
                  <tr key={id} style={{ borderTop: '1px solid var(--br)' }}>
                    <td style={{ padding: '6px 8px 6px 0', color: 'var(--t2)' }}>{p.label}</td>
                    <td style={{ padding: '4px' }}>
                      <input
                        type="number" step="0.01" min="0"
                        className="sinp"
                        style={{ padding: '4px 6px', textAlign: 'right', fontFamily: 'var(--fm)', fontSize: 12 }}
                        value={p.in}
                        onChange={e => updatePrice(id, 'in', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '4px 0 4px 4px' }}>
                      <input
                        type="number" step="0.01" min="0"
                        className="sinp"
                        style={{ padding: '4px 6px', textAlign: 'right', fontFamily: 'var(--fm)', fontSize: 12 }}
                        value={p.out}
                        onChange={e => updatePrice(id, 'out', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <button className="bsave" style={{ padding: '6px 14px', fontSize: 12 }} onClick={savePrices} disabled={priceSaving}>
                {priceSaving ? 'Guardando...' : 'Actualizar precios'}
              </button>
              {priceMsg && <span style={{ fontSize: 11, color: 'var(--a)' }}>{priceMsg}</span>}
              <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 'auto' }}>El agente descarga estos valores en cada ciclo</span>
            </div>
          </div>
        )}

        {devs.length > 0 && (
          <div className="ms">
            <h4>Umbrales de gasto mensual <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400 }}>(USD / mes por dev)</span></h4>
            <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 10 }}>
              Si el costo proyectado supera el límite, aparece ⚠ en la tarjeta del dev. Dejá en blanco para sin límite.
            </p>
            {devs.map((dev, i) => (
              <div key={i} className="srow" style={{ marginBottom: 8 }}>
                <div className="sav" style={{ background: `${dev.color}18`, color: dev.color }}>{dev.name.slice(0, 2).toUpperCase()}</div>
                <span style={{ flex: 1, fontSize: 13 }}>{dev.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>$</span>
                  <input
                    type="number" min="0" step="1" placeholder="Sin límite"
                    className="sinp"
                    style={{ width: 100, padding: '5px 8px', fontSize: 12, fontFamily: 'var(--fm)', textAlign: 'right' }}
                    value={thresholds[dev.name] || ''}
                    onChange={e => setThresholds(prev => ({ ...prev, [dev.name]: e.target.value }))}
                  />
                  <span style={{ fontSize: 10, color: 'var(--t3)' }}>/mes</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="bsave" onClick={handleSave}>Guardar configuración</button>
      </div>
    </div>
  );
}
