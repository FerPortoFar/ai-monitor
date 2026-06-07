export const DEMO_DATA = {
  today: {
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`),
    developers: [
      { tokens: { input: 38400, output: 12800 }, requests: 24, costUSD: 2.18, tasks: { Código: 10, Debug: 7, Explicación: 4, Revisión: 2, Docs: 1 }, activity: [0,0,0,0,0,1,3,8,12,15,13,11,9,12,14,11,9,6,4,2,1,0,0,0], modelUsage: { 'Claude 3.5': 12, 'Haiku': 8, 'GPT-4o': 4 } },
      { tokens: { input: 19200, output: 6800 },  requests: 13, costUSD: 1.14, tasks: { Código: 5, Debug: 3, Explicación: 3, Revisión: 1, Docs: 1 },  activity: [0,0,0,0,0,0,1,4,8,7,6,5,5,7,8,7,5,4,2,1,0,0,0,0],   modelUsage: { 'Claude 3.5': 6,  'Haiku': 5, 'GPT-4o': 2 } },
      { tokens: { input: 9800,  output: 3200 },  requests: 7,  costUSD: 0.58, tasks: { Código: 3, Debug: 2, Explicación: 1, Revisión: 1, Docs: 0 },  activity: [0,0,0,0,0,0,0,2,4,5,4,3,3,4,5,4,3,2,1,0,0,0,0,0],   modelUsage: { 'Claude 3.5': 3,  'Haiku': 3, 'GPT-4o': 1 } }
    ]
  },
  week: {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    developers: [
      { tokens: { input: 284500, output: 97200 }, requests: 167, costUSD: 15.82, tasks: { Código: 52, Debug: 38, Explicación: 28, Revisión: 22, Docs: 27 }, activity: [45000,62000,38000,71000,55000,48000,62700], modelUsage: { 'Claude 3.5': 89, 'Haiku': 64, 'GPT-4o': 14 } },
      { tokens: { input: 142000, output: 51300 }, requests: 89,  costUSD: 8.34,  tasks: { Código: 31, Debug: 18, Explicación: 22, Revisión: 9,  Docs: 9  }, activity: [22000,28000,19000,35000,31000,28000,30300], modelUsage: { 'Claude 3.5': 42, 'Haiku': 38, 'GPT-4o': 9  } },
      { tokens: { input: 67800,  output: 23400 }, requests: 45,  costUSD: 3.98,  tasks: { Código: 18, Debug: 8,  Explicación: 12, Revisión: 4,  Docs: 3  }, activity: [8000,12000,9000,14000,13000,12000,13200],  modelUsage: { 'Claude 3.5': 22, 'Haiku': 17, 'GPT-4o': 6  } }
    ]
  },
  month: {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    developers: [
      { tokens: { input: 1240000, output: 428000 }, requests: 714, costUSD: 68.42, tasks: { Código: 218, Debug: 162, Explicación: 124, Revisión: 98,  Docs: 112 }, activity: [285000,312000,298000,345000], modelUsage: { 'Claude 3.5': 384, 'Haiku': 274, 'GPT-4o': 56 } },
      { tokens: { input: 621000,  output: 224000 }, requests: 382, costUSD: 36.18, tasks: { Código: 132, Debug: 78,  Explicación: 94,  Revisión: 42,  Docs: 36  }, activity: [142000,158000,172000,149000], modelUsage: { 'Claude 3.5': 182, 'Haiku': 162, 'GPT-4o': 38 } },
      { tokens: { input: 298000,  output: 102000 }, requests: 194, costUSD: 17.14, tasks: { Código: 76,  Debug: 34,  Explicación: 52,  Revisión: 18,  Docs: 14  }, activity: [88000,78000,96000,68000],    modelUsage: { 'Claude 3.5': 96,  'Haiku': 74,  'GPT-4o': 24 } }
    ]
  }
};

export const DEMO_SESSIONS = [
  { ts: '17:42', devIndex: 0, task: 'Código',      model: 'Claude 3.5', inputTokens: 3240, outputTokens: 1120, costUSD: 0.22 },
  { ts: '17:28', devIndex: 1, task: 'Debug',        model: 'Haiku',      inputTokens: 1840, outputTokens: 560,  costUSD: 0.06 },
  { ts: '17:15', devIndex: 0, task: 'Revisión',     model: 'Claude 3.5', inputTokens: 2100, outputTokens: 840,  costUSD: 0.16 },
  { ts: '16:58', devIndex: 2, task: 'Explicación',  model: 'Claude 3.5', inputTokens: 4200, outputTokens: 1680, costUSD: 0.32 },
  { ts: '16:44', devIndex: 0, task: 'Código',       model: 'Claude 3.5', inputTokens: 5600, outputTokens: 1900, costUSD: 0.42 },
  { ts: '16:32', devIndex: 1, task: 'Docs',         model: 'Haiku',      inputTokens: 920,  outputTokens: 380,  costUSD: 0.03 },
  { ts: '16:18', devIndex: 2, task: 'Debug',        model: 'GPT-4o',     inputTokens: 1560, outputTokens: 480,  costUSD: 0.08 },
  { ts: '16:05', devIndex: 0, task: 'Código',       model: 'Claude 3.5', inputTokens: 7840, outputTokens: 2640, costUSD: 0.58 },
  { ts: '15:52', devIndex: 1, task: 'Explicación',  model: 'Claude 3.5', inputTokens: 3120, outputTokens: 1040, costUSD: 0.24 },
  { ts: '15:38', devIndex: 0, task: 'Debug',        model: 'Haiku',      inputTokens: 2200, outputTokens: 720,  costUSD: 0.08 },
  { ts: '15:24', devIndex: 2, task: 'Código',       model: 'Claude 3.5', inputTokens: 4800, outputTokens: 1560, costUSD: 0.36 },
  { ts: '15:10', devIndex: 1, task: 'Revisión',     model: 'Claude 3.5', inputTokens: 1840, outputTokens: 620,  costUSD: 0.14 },
  { ts: '14:55', devIndex: 0, task: 'Código',       model: 'GPT-4o',     inputTokens: 3600, outputTokens: 1200, costUSD: 0.18 },
  { ts: '14:42', devIndex: 2, task: 'Docs',         model: 'Haiku',      inputTokens: 1100, outputTokens: 440,  costUSD: 0.04 },
  { ts: '14:28', devIndex: 0, task: 'Explicación',  model: 'Claude 3.5', inputTokens: 2800, outputTokens: 940,  costUSD: 0.20 },
  { ts: '14:15', devIndex: 1, task: 'Código',       model: 'Claude 3.5', inputTokens: 6200, outputTokens: 2100, costUSD: 0.48 },
  { ts: '14:02', devIndex: 2, task: 'Debug',        model: 'Haiku',      inputTokens: 1680, outputTokens: 520,  costUSD: 0.05 },
  { ts: '13:48', devIndex: 0, task: 'Código',       model: 'Claude 3.5', inputTokens: 8900, outputTokens: 3100, costUSD: 0.72 },
  { ts: '13:35', devIndex: 1, task: 'Explicación',  model: 'Haiku',      inputTokens: 2400, outputTokens: 820,  costUSD: 0.07 },
  { ts: '13:22', devIndex: 0, task: 'Revisión',     model: 'Claude 3.5', inputTokens: 3100, outputTokens: 1040, costUSD: 0.23 }
];

export const DEMO_HEATMAP = [
  { day: 'Lun', v: [0,0,0,0,0,1,4,9,13,16,14,12,10,13,15,12,10,7,4,2,1,0,0,0] },
  { day: 'Mar', v: [0,0,0,0,0,2,5,12,16,20,17,14,12,16,19,15,12,8,5,2,1,0,0,0] },
  { day: 'Mié', v: [0,0,0,0,0,1,3,7,10,13,11,9,8,10,12,10,8,5,3,1,0,0,0,0] },
  { day: 'Jue', v: [0,0,0,0,0,2,6,14,20,24,22,18,15,19,22,18,14,10,6,3,1,0,0,0] },
  { day: 'Vie', v: [0,0,0,0,0,1,4,10,15,18,16,13,11,15,17,14,11,8,5,2,1,0,0,0] },
  { day: 'Sáb', v: [0,0,0,0,0,0,2,6,8,10,8,7,6,8,9,7,6,4,2,1,0,0,0,0] },
  { day: 'Dom', v: [0,0,0,0,0,0,1,3,5,6,5,4,4,5,6,5,4,3,1,0,0,0,0,0] }
];

export const DEMO_HISTORY = {
  months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  devCosts: [
    [45.2, 52.1, 48.3, 61.4, 58.2, 68.4],
    [22.1, 28.4, 25.2, 31.8, 30.1, 36.2],
    [11.8, 14.2, 12.9, 16.4, 15.8, 17.1],
  ],
};

export const DEMO_TRENDS = {
  today: [
    { tokensDelta: 8.2,   costDelta: 8.2   },
    { tokensDelta: -12.4, costDelta: -12.4  },
    { tokensDelta: 22.6,  costDelta: 22.6   },
  ],
  week: [
    { tokensDelta: 14.2,  costDelta: 14.2   },
    { tokensDelta: -6.8,  costDelta: -6.8   },
    { tokensDelta: 9.4,   costDelta: 9.4    },
  ],
  month: [
    { tokensDelta: 21.5,  costDelta: 21.5   },
    { tokensDelta: 3.2,   costDelta: 3.2    },
    { tokensDelta: -4.1,  costDelta: -4.1   },
  ],
};
