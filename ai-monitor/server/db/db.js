import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db = null;

try {
  const { default: Database } = await import('better-sqlite3');
  const instance = new Database(join(__dirname, '../../data.sqlite'));
  instance.pragma('journal_mode = WAL');
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  instance.exec(schema);
  db = instance;
} catch {
  // DEMO_MODE or native module unavailable — in-memory fallback
  console.warn('[db] better-sqlite3 not available, running without persistence');
  db = {
    prepare: () => ({
      all: () => [],
      run: () => ({ lastInsertRowid: 0 }),
    }),
    transaction: (fn) => fn,
    exec: () => {},
  };
}

export default db;
