-- This is an empty migration.
DROP INDEX IF EXISTS idx_fts_snippets;
CREATE INDEX idx_fts_snippets ON public.snippets USING gin (to_tsvector('english'::regconfig, source_content));