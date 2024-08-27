-- AlterTable
ALTER TABLE "lesson_summaries" ADD COLUMN     "concepts" TEXT[],
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "learningObjectives" TEXT[],
ADD COLUMN     "reasoning" TEXT,
ADD COLUMN     "topics" TEXT[];
