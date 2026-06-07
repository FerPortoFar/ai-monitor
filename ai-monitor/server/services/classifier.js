const PATTERNS = {
  'Código':      [/\bcodigo\b/i, /\bfunction\b/i, /\bimplementa\b/i, /\bscript\b/i, /```/],
  'Debug':       [/\berror\b/i, /\bbug\b/i, /\bfalla\b/i, /\bexception\b/i, /\btraceback\b/i],
  'Revisión':    [/\brevis[aá]\b/i, /\breview\b/i, /\brefactor\b/i, /\bmejora\b/i],
  'Explicación': [/\bexplica\b/i, /\bqu[eé] es\b/i, /\bc[oó]mo funciona\b/i, /\benti[eé]ndo\b/i],
  'Docs':        [/\bdocumenta\b/i, /\breadme\b/i, /\bcomenta\b/i, /\bdocstring\b/i],
};

export function classifyTask(promptText) {
  for (const [task, patterns] of Object.entries(PATTERNS)) {
    if (patterns.some(p => p.test(promptText))) return task;
  }
  return 'Código';
}
