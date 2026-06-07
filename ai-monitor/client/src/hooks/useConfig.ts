import { useState, useCallback } from 'react';
import type { DashboardConfig } from '../types/dashboard';

const STORAGE_KEY = 'aim-cfg';

const DEFAULT: DashboardConfig = {
  team: '',
  model: '',
  palette: 'green',
  apiKeyMapping: {}
};

function load(): DashboardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT;
}

export function useConfig() {
  const [config, setConfig] = useState<DashboardConfig>(load);

  const save = useCallback((updates: Partial<DashboardConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // also sync with backend
      fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      }).catch(() => {});
      return next;
    });
  }, []);

  return { config, save };
}
