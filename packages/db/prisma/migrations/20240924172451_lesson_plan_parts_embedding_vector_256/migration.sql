-- This changes the embedding column from a 1536 vector to a 256 vector
ALTER TABLE lesson_plan_parts ADD COLUMN embedding_temp vector(256);
ALTER TABLE lesson_plan_parts DROP COLUMN embedding;
ALTER TABLE lesson_plan_parts RENAME COLUMN embedding_temp TO embedding;