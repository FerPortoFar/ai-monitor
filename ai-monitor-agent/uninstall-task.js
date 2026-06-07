/**
 * Desinstala la Tarea Programada del agente AI Monitor.
 * Ejecutar con: node uninstall-task.js
 */

const { execSync } = require('child_process');

const TASK_NAME = 'AI-Monitor-Agent';

console.log(`[Uninstall] Eliminando tarea "${TASK_NAME}"...`);

try {
  execSync(`schtasks /Delete /TN "${TASK_NAME}" /F`, { stdio: 'inherit' });
  console.log('[Uninstall] Tarea eliminada correctamente.');
} catch (err) {
  console.error('[Uninstall] Error:', err.message);
  console.error('[Uninstall] Verificá que la tarea exista con: schtasks /Query /TN "AI-Monitor-Agent"');
  process.exit(1);
}
