-- 0005_email_reminders.sql
-- Add email reminder preferences to users table

ALTER TABLE users ADD COLUMN email_reminder_enabled INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'Asia/Jakarta';
