import { useState, KeyboardEvent } from 'react';

interface Props {
  onLogin: (user: string) => void;
  teamName: string;
}

const NeuralIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="12" cy="12" r="3.5"/>
    <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="21" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="21" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="5.6" cy="5.6" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="18.4" cy="18.4" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="5.6" cy="18.4" r="1.3" fill="currentColor" stroke="none"/>
    <circle cx="18.4" cy="5.6" r="1.3" fill="currentColor" stroke="none"/>
    <line x1="12" y1="8.5" x2="12" y2="4.5"/><line x1="12" y1="15.5" x2="12" y2="19.5"/>
    <line x1="8.5" y1="12" x2="4.5" y2="12"/><line x1="15.5" y1="12" x2="19.5" y2="12"/>
    <line x1="9.2" y1="9.2" x2="6.9" y2="6.9"/><line x1="14.8" y1="14.8" x2="17.1" y2="17.1"/>
    <line x1="9.2" y1="14.8" x2="6.9" y2="17.1"/><line x1="14.8" y1="9.2" x2="17.1" y2="6.9"/>
  </svg>
);

export default function Login({ onLogin, teamName }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError('Ingresa usuario y contraseña para continuar');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Usuario o contraseña incorrectos');
      } else {
        onLogin(data.user);
      }
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div className="login-wrap">
      <div className="lglow" />
      <div className="lcard">
        <div className="llogo">
          <div className="llogo-i"><NeuralIcon /></div>
          <div className="llogo-t">
            <h1>AI Monitor</h1>
            <p>{teamName || 'Panel de agentes IA'}</p>
          </div>
        </div>
        <h2>Bienvenido</h2>
        <p>Inicia sesión para acceder al panel de tu equipo</p>
        {error && <div className="lerr">{error}</div>}
        <div className="fg">
          <label>Usuario</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={handleKeyDown} placeholder="usuario@empresa.com" autoComplete="username" />
        </div>
        <div className="fg">
          <label>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" autoComplete="current-password" style={{ paddingRight: 40, width: '100%', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', padding: 0, display: 'flex', alignItems: 'center' }} title={showPwd ? 'Ocultar' : 'Mostrar'}>
              {showPwd ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <button className="btn-pri" onClick={handleLogin} disabled={loading}>{loading ? 'Verificando...' : 'Entrar al panel'}</button>
        <div className="lfoot">¿Solo explorar? <a onClick={() => onLogin('Demo')}>Modo demo →</a></div>
      </div>
    </div>
  );
}
