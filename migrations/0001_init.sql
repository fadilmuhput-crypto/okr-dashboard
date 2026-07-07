-- OwntheWay — initial schema
-- users + sessions (hand-rolled auth) + okr_state (JSON blob, matches
-- frontend state shape 1:1 for a zero-transform migration path from
-- localStorage) + checkins (relational, append-only — this is the table
-- that actually measures the North Star Metric: Weekly Review Completion Rate)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS okr_state (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  state_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  scope TEXT NOT NULL,
  objective_id TEXT NOT NULL,
  confidence_snapshot TEXT NOT NULL,
  accomplished TEXT,
  challenges TEXT,
  next_priorities TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id, week_number);
