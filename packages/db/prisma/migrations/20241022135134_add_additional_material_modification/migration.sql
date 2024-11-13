-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AilaUserModificationAction" ADD VALUE 'ADD_HOMEWORK_TASK';
ALTER TYPE "public"."AilaUserModificationAction" ADD VALUE 'ADD_NARRATIVE';
ALTER TYPE "public"."AilaUserModificationAction" ADD VALUE 'ADD_PRACTICE_QUESTIONS';
ALTER TYPE "public"."AilaUserModificationAction" ADD VALUE 'TRANSLATE_KEYWORDS';
ALTER TYPE "public"."AilaUserModificationAction" ADD VALUE 'ADD_PRACTICAL_INSTRUCTIONS';

-- AlterTable
ALTER TABLE "ingest"."ingest" ALTER COLUMN "config" SET DEFAULT '{}';
