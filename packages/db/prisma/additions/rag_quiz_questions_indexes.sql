-- Also in migration: 20260319165220_apply_rag_additions
CREATE INDEX IF NOT EXISTS idx_rag_quiz_questions_embedding_ann
ON rag.quiz_questions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
