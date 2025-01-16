CREATE INDEX IF NOT EXISTS idx_rag_lesson_plan_parts_embedding_ann
ON rag.rag_lesson_plan_parts
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);