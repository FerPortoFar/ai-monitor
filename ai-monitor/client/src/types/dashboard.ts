export interface ProjectData {
  displayName: string;
  tokens: { input: number; output: number };
  costUSD?: number;
  requests: number;
  modelUsage: Record<string, number>;
  lastWorked?: string | null;
}

export interface DevData {
  tokens: { input: number; output: number };
  requests: number;
  costUSD: number;
  tasks: Record<string, number>;
  activity: number[];
  modelUsage: Record<string, number>;
  projects?: Record<string, ProjectData>;
}

export interface DevTrend {
  tokensDelta: number | null;
  costDelta: number | null;
}

export interface MonthHistory {
  months: string[];
  devCosts: number[][];
}

export interface PeriodData {
  labels: string[];
  developers: DevData[];
  configuredIndices?: number[];
  devTrends?: DevTrend[];
}

export interface Session {
  ts: string;
  devIndex: number;
  task: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
}

export interface HeatmapRow {
  day: string;
  v: number[];
}

export interface Developer {
  name: string;
  color: string;
  token?: string;
  machineUser?: string | null;
  lastSeen?: string | null;
  hasData?: boolean;
  // legacy (keep for backward compat)
  claudeDir?: string;
  dirOk?: boolean;
}

export interface Agent {
  token: string;
  alias: string;
  color: string;
  machineUser?: string | null;
  lastSeen?: string | null;
  hasData?: boolean;
}

export interface DashboardConfig {
  team: string;
  model: string;
  palette: 'green' | 'indigo' | 'blue' | 'amber' | 'rose';
  apiKeyMapping: Record<string, number>;
  serverUrl?: string;
}

export const DEV_PALETTE = ['#818cf8','#fbbf24','#38bdf8','#34d399','#f87171','#fb923c','#a78bfa','#f472b6'];

export type Period = 'today' | 'week' | 'month';
export type View = 'overview' | 'developers' | 'activity' | 'admin';
