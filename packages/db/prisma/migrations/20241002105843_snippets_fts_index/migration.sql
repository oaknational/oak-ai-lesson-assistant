-- Add full-text search index to the snippets table (for Open API performance)
CREATE INDEX "idx_fts_snippets"
ON "snippets"
USING GIN ((to_tsvector('english', "source_content")) tsvector_ops);