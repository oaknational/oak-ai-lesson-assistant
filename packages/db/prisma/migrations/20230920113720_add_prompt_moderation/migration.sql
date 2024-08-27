-- AlterEnum
ALTER TYPE "GenerationStatus" ADD VALUE 'FLAGGED';

-- AlterTable
ALTER TABLE "generations" ADD COLUMN     "moderationResults" JSONB;
