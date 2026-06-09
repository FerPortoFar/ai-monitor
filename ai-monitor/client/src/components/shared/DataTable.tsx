import { useState, useRef, useEffect } from 'react';

export interface ColDef<T = any> {
  key: string;
  label: string;
  render?:   (row: T, i: number) => React.ReactNode;
  printVal?: (row: T) => string;
  sortVal?:  (row: T) => string | number;
  align?:    'left' | 'right' | 'center';
  hidden?:   boolean;
  width?:    string | number;
}

interface Props<T = any> {
  title:       string;
  subtitle?:   string | React.ReactNode;
  columns:     ColDef<T>[];
  data:        T[];
  storageKey?: string;
}

type SortDir = 'asc' | 'desc';

function loadPref(key: string | undefined, cols: ColDef[]) {
  if (!key) return null;
  try { return JSON.parse(localStorage.getItem(`dt:${key}`) || 'null'); } catch { return null; }
}
function savePref(key: string | undefined, val: any) {
  if (!key) return;
  localStorage.setItem(`dt:${key}`, JSON.stringify(val));
}

export default function DataTable<T>({ title, subtitle, columns, data, storageKey }: Props<T>) {
  const saved = loadPref(storageKey, columns);

  const [order,      setOrder]      = useState<string[]>(() => {
    const savedOrder: string[] = saved?.order || [];
    const allKeys = columns.map(c => c.key);
    // Columnas nuevas que no estaban en el orden guardado → agregar al final
    const newKeys = allKeys.filter(k => !savedOrder.includes(k));
    return savedOrder.length > 0 ? [...savedOrder, ...newKeys] : allKeys;
  });
  const [hidden,     setHidden]     = useState<Set<string>>(() => new Set(saved?.hidden || columns.filter(c => c.hidden).map(c => c.key)));
  const [sortKey,    setSortKey]    = useState<string | null>(saved?.sortKey || null);
  const [sortDir,    setSortDir]    = useState<SortDir>(saved?.sortDir || 'asc');
  const [showMenu,   setShowMenu]   = useState(false);

  const dragSrc = useRef<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Persist prefs
  useEffect(() => {
    savePref(storageKey, { order, hidden: [...hidden], sortKey, sortDir });
  }, [order, hidden, sortKey, sortDir, storageKey]);

  // Close column menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  const colMap     = Object.fromEntries(columns.map(c => [c.key, c]));
  const visibleKeys = order.filter(k => !hidden.has(k) && colMap[k]);
  const visCols    = visibleKeys.map(k => colMap[k]);

  // ── Sort ──────────────────────────────────────────────────────────────────────
  let rows = [...data];
  if (sortKey && colMap[sortKey]?.sortVal) {
    const fn = colMap[sortKey].sortVal!;
    rows.sort((a, b) => {
      const va = fn(a), vb = fn(b);
      return (va < vb ? -1 : va > vb ? 1 : 0) * (sortDir === 'asc' ? 1 : -1);
    });
  }

  function handleSort(key: string) {
    if (!colMap[key]?.sortVal) return;
    if (sortKey === key) {
      sortDir === 'asc' ? setSortDir('desc') : (setSortKey(null));
    } else {
      setSortKey(key); setSortDir('asc');
    }
  }

  // ── Drag to reorder ───────────────────────────────────────────────────────────
  function onDragStart(key: string) { dragSrc.current = key; }
  function onDragOver(e: React.DragEvent, key: string) {
    e.preventDefault();
    if (!dragSrc.current || dragSrc.current === key) return;
    const from = order.indexOf(dragSrc.current);
    const to   = order.indexOf(key);
    if (from === -1 || to === -1) return;
    const next = [...order]; next.splice(from, 1); next.splice(to, 0, dragSrc.current);
    setOrder(next);
  }
  function onDragEnd() { dragSrc.current = null; }

  function toggleCol(key: string) {
    setHidden(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  // ── Print ─────────────────────────────────────────────────────────────────────
  function handlePrint() {
    const win = window.open('', '_blank', 'width=960,height=720');
    if (!win) return;
    const subtitleText = typeof subtitle === 'string' ? subtitle : '';
    const bodyRows = rows.map(row =>
      `<tr>${visCols.map(col => {
        const txt = col.printVal ? col.printVal(row) : String((row as any)[col.key] ?? '');
        return `<td style="text-align:${col.align || 'left'}">${txt}</td>`;
      }).join('')}</tr>`
    ).join('');

    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:20px}
      h2{font-size:16px;margin-bottom:4px}p{font-size:11px;color:#666;margin-bottom:14px}
      table{width:100%;border-collapse:collapse}
      th{text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#555;padding:8px 10px;border-bottom:2px solid #ddd}
      td{padding:7px 10px;border-bottom:1px solid #eee;vertical-align:top}
      tr:nth-child(even) td{background:#fafafa}
      @media print{body{padding:0}}
    </style></head><body>
    <h2>${title}</h2>${subtitleText ? `<p>${subtitleText}</p>` : ''}
    <table><thead><tr>${visCols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
    <tbody>${bodyRows}</tbody></table>
    <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`);
    win.document.close();
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="tbl-wrap">
      <div className="tbl-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <span style={{ fontSize: 11, color: 'var(--t2)' }}>{subtitle}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Column chooser */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button className="dt-btn" title="Mostrar / ocultar columnas" onClick={() => setShowMenu(v => !v)}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="3" width="5" height="14" rx="1"/><rect x="9" y="3" width="5" height="14" rx="1"/>
              </svg>
              <span style={{ fontSize: 10, marginLeft: 4 }}>Columnas</span>
            </button>
            {showMenu && (
              <div className="dt-menu">
                <div className="dt-menu-title">Columnas visibles</div>
                {order.map(key => {
                  const col = colMap[key];
                  if (!col) return null;
                  return (
                    <label key={key} className="dt-menu-item">
                      <input type="checkbox" checked={!hidden.has(key)} onChange={() => toggleCol(key)} style={{ accentColor: 'var(--a)', marginRight: 8 }} />
                      {col.label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* CSV Export */}
          <button className="dt-btn" title="Exportar CSV" onClick={() => {
            const header = visCols.map(c => `"${c.label}"`).join(',');
            const body   = rows.map(row =>
              visCols.map(col => {
                const v = col.printVal ? col.printVal(row) : String((row as any)[col.key] ?? '');
                return `"${v.replace(/"/g, '""')}"`;
              }).join(',')
            ).join('\n');
            const blob = new Blob([`\uFEFF${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url; a.download = `${title.replace(/\s+/g, '_')}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 14v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2M10 3v10M7 10l3 3 3-3"/>
            </svg>
            <span style={{ fontSize: 10, marginLeft: 4 }}>CSV</span>
          </button>

          {/* Print */}
          <button className="dt-btn" title="Imprimir informe" onClick={handlePrint}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 7V2h10v5"/><rect x="2" y="7" width="16" height="8" rx="1"/>
              <path d="M5 15v3h10v-3"/><circle cx="15.5" cy="11" r="1" fill="currentColor" stroke="none"/>
            </svg>
            <span style={{ fontSize: 10, marginLeft: 4 }}>Imprimir</span>
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              {visCols.map(col => {
                const sorted   = sortKey === col.key;
                const sortable = !!col.sortVal;
                return (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={() => onDragStart(col.key)}
                    onDragOver={e => onDragOver(e, col.key)}
                    onDragEnd={onDragEnd}
                    onClick={() => handleSort(col.key)}
                    title={sortable ? 'Click para ordenar · Arrastrar para mover' : 'Arrastrar para mover'}
                    style={{ cursor: sortable ? 'pointer' : 'grab', userSelect: 'none', textAlign: col.align || 'left', width: col.width, whiteSpace: 'nowrap' }}
                  >
                    {col.label}
                    {sortable && (
                      <span style={{ marginLeft: 3, opacity: sorted ? 1 : 0.25, fontSize: 11 }}>
                        {sorted ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={visCols.length} style={{ textAlign: 'center', color: 'var(--t3)', padding: 24 }}>Sin datos</td></tr>
              : rows.map((row, i) => (
                <tr key={i}>
                  {visCols.map(col => (
                    <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row, i) : String((row as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
