-- Remove the mistakenly added column from the ingest_lesson table
ALTER TABLE "ingest"."ingest_lesson"
DROP COLUMN IF EXISTS config;

-- Add the config column to the correct ingest table
ALTER TABLE "ingest"."ingest"
ADD COLUMN config JSONB NOT NULL;
