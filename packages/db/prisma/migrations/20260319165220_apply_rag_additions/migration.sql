-- Indexes that Prisma can't express (ivfflat, partial unique).
-- Source of truth: prisma/additions/*.sql
-- Also applied by db-push via the additions folder.

-- From: additions/rag_lesson_plans_ivfflat_index.sql
CREATE INDEX IF NOT EXISTS idx_rag_lesson_plan_parts_embedding_ann
ON rag.rag_lesson_plan_parts
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- From: additions/rag_lesson_plans_unique_slug_index.sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_rag_lesson_plans_unique_published_oak_lesson_slug
ON rag.rag_lesson_plans (oak_lesson_slug)
WHERE is_published = TRUE;

-- From: additions/rag_quiz_questions_indexes.sql
CREATE INDEX IF NOT EXISTS idx_rag_quiz_questions_embedding_ann
ON rag.quiz_questions USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
