-- Sets isShared to true for all chat sessions that have a sharePath
-- In a later migration, we will remove the sharePath field and only use isShared
UPDATE app_sessions
SET output = jsonb_set(output, '{isShared}', 'true', true)
WHERE (output->>'sharePath') IS NOT NULL AND (output->>'sharePath') <> '';
