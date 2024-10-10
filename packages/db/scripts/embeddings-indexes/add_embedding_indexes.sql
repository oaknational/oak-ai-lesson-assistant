-- Add vector index for quiz_questions table
CREATE INDEX IF NOT EXISTS vector_questions_embedding_idx 
ON "questions" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for quiz_answers table
CREATE INDEX IF NOT EXISTS vector_answers_embedding_idx 
ON "answers" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for lesson_plans table
CREATE INDEX IF NOT EXISTS vector_lesson_plans_embedding_idx 
ON "lesson_plans" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for lesson_plan_parts table
CREATE INDEX IF NOT EXISTS vector_lesson_plan_parts_embedding_idx 
ON "lesson_plan_parts" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for snippet table
CREATE INDEX IF NOT EXISTS vector_snippets_embedding_idx 
ON "snippets" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for lesson_plans table
CREATE INDEX IF NOT EXISTS vector_lesson_summaries_embedding_idx 
ON "lesson_summaries" USING ivfflat (embedding vector_cosine_ops);