-- Add vector index for quiz_questions table
CREATE INDEX IF NOT EXISTS idx_quiz_questions_embedding 
ON "quiz_questions" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for quiz_answers table
CREATE INDEX IF NOT EXISTS idx_quiz_answers_embedding 
ON "quiz_answers" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for lesson_plans table
CREATE INDEX IF NOT EXISTS idx_lesson_plans_embedding 
ON "lesson_plans" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for lesson_plan_parts table
CREATE INDEX IF NOT EXISTS idx_lesson_plan_parts_embedding 
ON "lesson_plan_parts" USING ivfflat (embedding vector_cosine_ops);

-- Add vector index for snippet table
CREATE INDEX IF NOT EXISTS idx_snippet_embedding 
ON "snippet" USING ivfflat (embedding vector_cosine_ops);