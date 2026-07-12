-- Add expiry to invite codes and track acceptance.
-- Invites expire after 7 days by default. Once expired or accepted,
-- the link is invalid.

ALTER TABLE project_invites ADD COLUMN expires_at INTEGER NOT NULL;
ALTER TABLE project_invites ADD COLUMN accepted_by TEXT REFERENCES users(id);
