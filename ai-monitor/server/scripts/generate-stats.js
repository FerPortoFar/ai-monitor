/**
 * generate-stats.js
 * Parsea los archivos .jsonl de Claude Code (~/.claude/projects/)
 * y genera stats-cache.json con el formato esperado por statsParser.js
 *
 * Uso:
 *   node generate-stats.js [outputPath]
 *
 * Si no se pasa outputPath, escribe en la ruta configurada en DEV_0_STATS del .env
 */

import 'dotenv/config';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Config ---
const CLAUDE_DIR = join(homedir(), '.claude', 'projects');
const OUTPUT_PATH = process.argv[2]
  || process.env.DEV_0_STATS
  || join(homedir(), '.claude', 'stats-cache.json');

// --- Helpers ---
function dateOf(isoStr) {
  return isoStr ? isoStr.slice(0, 10) : null;
}

function hourOf(isoStr) {
  return isoStr ? parseInt(isoStr.slice(11, 13), 10) : null;
}

function findJsonlFiles(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) results.push(...findJsonlFiles(full));
      else if (entry.endsWith('.jsonl')) results.push(full);
    }
  } catch { /* ignorar dirs sin permiso */ }
  return results;
}

// --- Parseo ---
function parseAllJsonl(claudeDir) {
  const files = findJsonlFiles(claudeDir);
  console.log(`Procesando ${files.length} archivos JSONL...`);

  // Acumuladores
  const dailyModelTokens = {}; // date -> model -> outputTokens
  const dailyActivity    = {}; // date -> { messageCount, userMessages }
  const modelUsage       = {}; // model -> { inputTokens, outputTokens, cacheCreationInputTokens }
  const hourCounts       = {}; // hour -> count

  let totalAssistant = 0;

  for (const file of files) {
    let lines;
    try {
      lines = readFileSync(file, 'utf8').split('\n').filter(l => l.trim());
    } catch { continue; }

    for (const line of lines) {
      let entry;
      try { entry = JSON.parse(line); } catch { continue; }

      // Solo mensajes tipo assistant con usage
      if (entry.type !== 'assistant') continue;
      const usage = entry.message?.usage;
      if (!usage) continue;

      const model     = entry.message?.model || 'unknown';
      const timestamp = entry.timestamp;
      if (!timestamp) continue;

      const date = dateOf(timestamp);
      const hour = hourOf(timestamp);

      // dailyModelTokens: acumular output tokens por modelo por día
      if (!dailyModelTokens[date]) dailyModelTokens[date] = {};
      dailyModelTokens[date][model] = (dailyModelTokens[date][model] || 0) + (usage.output_tokens || 0);

      // dailyActivity: contar mensajes assistant por día
      if (!dailyActivity[date]) dailyActivity[date] = { messageCount: 0 };
      dailyActivity[date].messageCount++;

      // modelUsage: totales globales por modelo
      if (!modelUsage[model]) modelUsage[model] = { inputTokens: 0, outputTokens: 0, cacheCreationInputTokens: 0 };
      modelUsage[model].inputTokens               += (usage.input_tokens || 0);
      modelUsage[model].outputTokens              += (usage.output_tokens || 0);
      modelUsage[model].cacheCreationInputTokens  += (usage.cache_creation_input_tokens || 0);

      // hourCounts
      if (hour !== null) {
        hourCounts[String(hour)] = (hourCounts[String(hour)] || 0) + 1;
      }

      totalAssistant++;
    }
  }

  console.log(`Mensajes assistant procesados: ${totalAssistant}`);

  // Convertir a arrays ordenados
  const sortedDates = Object.keys(dailyModelTokens).sort();

  const dailyModelTokensArr = sortedDates.map(date => ({
    date,
    tokensByModel: dailyModelTokens[date],
  }));

  const dailyActivityArr = sortedDates.map(date => ({
    date,
    messageCount: dailyActivity[date]?.messageCount || 0,
  }));

  return { dailyModelTokens: dailyModelTokensArr, dailyActivity: dailyActivityArr, modelUsage, hourCounts };
}

// --- Main ---
if (!existsSync(CLAUDE_DIR)) {
  console.error(`No se encontró: ${CLAUDE_DIR}`);
  process.exit(1);
}

const stats = parseAllJsonl(CLAUDE_DIR);

// Resumen
const totalOut = Object.values(stats.modelUsage).reduce((s, m) => s + m.outputTokens, 0);
const totalIn  = Object.values(stats.modelUsage).reduce((s, m) => s + m.inputTokens, 0);
console.log(`Total tokens — input: ${totalIn.toLocaleString()}  output: ${totalOut.toLocaleString()}`);
console.log(`Días con actividad: ${stats.dailyModelTokens.length}`);
console.log(`Modelos: ${Object.keys(stats.modelUsage).join(', ')}`);

writeFileSync(OUTPUT_PATH, JSON.stringify(stats, null, 2));
console.log(`\nEscrito en: ${OUTPUT_PATH}`);
