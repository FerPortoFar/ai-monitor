import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useConfig } from './hooks/useConfig';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const { config } = useConfig();

  useEffect(() => {
    const stored = sessionStorage.getItem('aim-user');
    if (stored) setUser(stored);
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-pal', config.palette || 'green');
  }, [config.palette]);

  function handleLogin(username: string) {
    sessionStorage.setItem('aim-user', username);
    setUser(username);
  }

  function handleLogout() {
    fetch('/api/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    sessionStorage.removeItem('aim-user');
    setUser(null);
  }

  if (!user) return <Login onLogin={handleLogin} teamName={config.team} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
