ALTER TABLE "ingest"."ingest_lesson"
ADD COLUMN config JSONB NOT NULL DEFAULT '{}'::JSONB;
