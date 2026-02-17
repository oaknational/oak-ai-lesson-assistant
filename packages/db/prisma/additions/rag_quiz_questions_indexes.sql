CREATE INDEX IF NOT EXISTS idx_rag_quiz_questions_embedding_ann
ON rag.quiz_questions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_rag_quiz_questions_description_fts
ON rag.quiz_questions USING gin (to_tsvector('english', description));
