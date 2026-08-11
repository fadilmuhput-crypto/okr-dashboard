-- 0008_alignment.sql
-- Project-level goal alignment hierarchy (Company → Dept → Team → Individual).
-- A project can declare it "aligns to" another project's objective; the
-- parent's dashboard then rolls up its aligned child projects.

ALTER TABLE projects ADD COLUMN parent_id TEXT;
ALTER TABLE projects ADD COLUMN parent_objective_id TEXT;
CREATE INDEX IF NOT EXISTS idx_projects_parent ON projects(parent_id);
