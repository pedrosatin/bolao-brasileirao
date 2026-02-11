-- D1 migration: submission tokens + admin operations support

CREATE TABLE IF NOT EXISTS submission_tokens (
  round_id INTEGER PRIMARY KEY,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds(id)
);

CREATE INDEX IF NOT EXISTS idx_submission_tokens_expires_at
  ON submission_tokens (expires_at);
