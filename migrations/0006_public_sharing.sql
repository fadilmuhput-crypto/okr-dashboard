-- 0006_public_sharing.sql
-- Add public sharing support to projects

ALTER TABLE projects ADD COLUMN public_token TEXT;
ALTER TABLE projects ADD COLUMN is_public INTEGER DEFAULT 0;
