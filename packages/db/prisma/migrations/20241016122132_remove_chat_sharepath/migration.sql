/*
  This migration removes the redundant `sharePath` proprty from the output column from the `app_sessions` table.
*/
UPDATE app_sessions
SET output = output - 'sharePath'
WHERE output ? 'sharePath';