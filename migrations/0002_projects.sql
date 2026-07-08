-- Projects become first-class, shareable entities instead of nested JSON
-- inside a single user's blob. This is required for "invite a friend to
-- one board" — a project can now have multiple members.
--
-- objectives/KRs/initiatives stay as a JSON blob PER PROJECT (not per user)
-- — same nested shape the frontend already uses, just now owned by the
-- project row instead of buried inside okr_state.

ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  color_index INTEGER NOT NULL DEFAULT 0,
  objectives_json TEXT NOT NULL DEFAULT '[]',
  active_objective_id TEXT,
  week_number INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);

CREATE TABLE IF NOT EXISTS project_members (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'member'
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON project_members(user_id);

CREATE TABLE IF NOT EXISTS project_invites (
  code TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL
);
