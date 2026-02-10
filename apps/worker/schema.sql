-- D1 schema for bolao-brasileirao

CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  cutoff_at TEXT NOT NULL,
  last_sync_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rounds_season_number
  ON rounds (season, round_number);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL,
  api_match_id INTEGER NOT NULL,
  utc_date TEXT NOT NULL,
  status TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  external_link TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_api_match_id
  ON matches (api_match_id);

CREATE INDEX IF NOT EXISTS idx_matches_round_id
  ON matches (round_id);

CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  participant_name TEXT NOT NULL,
  pred_home_score INTEGER NOT NULL,
  pred_away_score INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds(id),
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_predictions_unique
  ON predictions (round_id, participant_name, match_id);

CREATE INDEX IF NOT EXISTS idx_predictions_round_name
  ON predictions (round_id, participant_name);

CREATE INDEX IF NOT EXISTS idx_predictions_match
  ON predictions (match_id);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL,
  participant_name TEXT NOT NULL,
  points_total INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_round_name
  ON scores (round_id, participant_name);
