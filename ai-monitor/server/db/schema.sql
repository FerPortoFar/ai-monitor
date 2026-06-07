CREATE TABLE IF NOT EXISTS sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT    NOT NULL,
  dev_index   INTEGER NOT NULL,
  api_key_id  TEXT,
  task_type   TEXT    NOT NULL DEFAULT 'Código',
  model       TEXT    NOT NULL,
  input_toks  INTEGER NOT NULL DEFAULT 0,
  output_toks INTEGER NOT NULL DEFAULT 0,
  cost_usd    REAL    NOT NULL DEFAULT 0,
  raw_meta    TEXT
);

CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
