import { useState, useEffect, useCallback } from 'react';
import type { PeriodData, Session, HeatmapRow, Period, Developer, Agent, MonthHistory } from '../types/dashboard';
import { DEMO_PERIODS, DEMO_SESSIONS, DEMO_HEATMAP, DEMO_DEVS, DEMO_HISTORY } from '../data/demoData';

export function useDashboard(period: Period, user?: string) {
  const [data,     setData]     = useState<PeriodData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [heatmap,  setHeatmap]  = useState<HeatmapRow[]>([]);
  const [devs,     setDevs]     = useState<Developer[]>([]);
  const [history,  setHistory]  = useState<MonthHistory | null>(null);
  const [loading,  setLoading]  = useState(true);

  const isDemo = user === 'Demo';

  const fetchAll = useCallback(async () => {
    if (isDemo) {
      setData(DEMO_PERIODS[period] ?? DEMO_PERIODS.week);
      setSessions(DEMO_SESSIONS);
      setHeatmap(DEMO_HEATMAP);
      setDevs(DEMO_DEVS);
      setHistory(DEMO_HISTORY);
      setLoading(false);
      return;
    }
    try {
      const [usageRes, sessRes, hmapRes, agentsRes, histRes] = await Promise.all([
        fetch(`/api/usage?period=${period}`,  { credentials: 'include' }),
        fetch(`/api/sessions`,                { credentials: 'include' }),
        fetch(`/api/sessions/heatmap`,        { credentials: 'include' }),
        fetch(`/api/agents`,                  { credentials: 'include' }),
        fetch(`/api/usage/history`,           { credentials: 'include' }),
      ]);
      if (usageRes.ok)  setData(await usageRes.json());
      if (sessRes.ok)   setSessions(await sessRes.json());
      if (hmapRes.ok)   setHeatmap(await hmapRes.json());
      if (histRes.ok)   setHistory(await histRes.json());
      if (agentsRes.ok) {
        const agents: Agent[] = await agentsRes.json();
        setDevs(agents.map(a => ({
          name:        a.alias,
          color:       a.color,
          token:       a.token,
          machineUser: a.machineUser,
          lastSeen:    a.lastSeen,
          hasData:     a.hasData,
          dirOk:       a.hasData,
        })));
      }
    } catch (e) {
      console.error('Fetch error', e);
    } finally {
      setLoading(false);
    }
  }, [period, isDemo]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  return { data, sessions, heatmap, devs, history, loading };
}
