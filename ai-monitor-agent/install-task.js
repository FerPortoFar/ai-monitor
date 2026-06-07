/**
 * Instala el agente AI Monitor como Tarea Programada de Windows.
 * Ejecutar con: node install-task.js
 * Requiere permisos de administrador.
 */

const { execSync } = require('child_process');
const { join }     = require('path');

const TASK_NAME = 'AI-Monitor-Agent';
const nodePath  = process.execPath;          // C:\...\node.exe
const agentPath = join(__dirname, 'agent.js');

console.log('[Install] Instalando AI Monitor Agent como tarea programada...');
console.log(`[Install] Node: ${nodePath}`);
console.log(`[Install] Agente: ${agentPath}`);

try {
  // Crear tarea: se ejecuta al iniciar sesión, con el usuario actual
  const cmd = [
    'schtasks /Create /F',
    `/TN "${TASK_NAME}"`,
    `/TR "\\"${nodePath}\\" \\"${agentPath}\\""`,
    '/SC ONLOGON',
    '/RL LIMITED',
    '/DELAY 0001:00',   // esperar 1 min después del login
  ].join(' ');

  execSync(cmd, { stdio: 'inherit' });

  console.log('');
  console.log(`[Install] OK — Tarea "${TASK_NAME}" creada.`);
  console.log('[Install] El agente se iniciará automáticamente al iniciar sesión.');
  console.log('[Install] Para iniciarlo ahora sin reiniciar:');
  console.log(`[Install]   node "${agentPath}"`);
} catch (err) {
  console.error('');
  console.error('[Install] ERROR al crear la tarea.');
  console.error('[Install] Asegurate de ejecutar como Administrador (click derecho → "Ejecutar como administrador").');
  console.error('[Install] Detalle:', err.message);
  process.exit(1);
}
