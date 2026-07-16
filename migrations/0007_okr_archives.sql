-- 0007_okr_archives.sql
-- Store OKR snapshots at quarter end for historical review

CREATE TABLE IF NOT EXISTS okr_archives (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL,          -- e.g. '2024-Q4', '2025-Q1'
  objectives_json TEXT NOT NULL,  -- snapshot of objectives_json
  week_number INTEGER NOT NULL,   -- final week number
  overall_confidence REAL,        -- final overall confidence
  grade TEXT,                     -- 'A', 'B', 'C', 'D', or NULL
  notes TEXT,                     -- optional notes about the quarter
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_archives_project ON okr_archives(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_archives_quarter ON okr_archives(project_id, quarter);
