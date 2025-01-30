CREATE UNIQUE INDEX IF NOT EXISTS idx_rag_lesson_plans_unique_published_oak_lesson_slug
ON rag.rag_lesson_plans (oak_lesson_slug)
WHERE is_published = TRUE;