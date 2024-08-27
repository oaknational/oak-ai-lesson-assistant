
-- AlterTable
ALTER TABLE "generations"
RENAME COLUMN "duration" TO "llm_time_taken";

-- AlterTable
ALTER TABLE "generations"
ADD COLUMN "completed_at" TIMESTAMP(3);
