/*
  Warnings:

  - Added the required column `oak_lesson_slug` to the `rag_lesson_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ingest"."ingest" ALTER COLUMN "config" DROP DEFAULT;

-- AlterTable
ALTER TABLE "rag"."rag_lesson_plans" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oak_lesson_slug" TEXT NOT NULL,
ALTER COLUMN "oak_lesson_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "idx_rag_lesson_plans_published_key_stage_subject" ON "rag"."rag_lesson_plans"("is_published", "key_stage_slug", "subject_slug");
