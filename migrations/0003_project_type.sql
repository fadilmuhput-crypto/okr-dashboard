-- Personal vs Team is now a real access-control distinction, not just a
-- name. Personal projects can never be invited to; Team projects behave
-- exactly as projects did before this migration. Existing rows default to
-- 'team' so no project silently loses its ability to invite/keep members.

ALTER TABLE projects ADD COLUMN type TEXT NOT NULL DEFAULT 'team';
