/*
  Warnings:

  - You are about to drop the column `captions_id` on the `ingest_lesson` table. All the data in the column will be lost.
  - You are about to drop the column `lesson_plan_id` on the `ingest_lesson` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ingest"."ingest_lesson_captions_id_key";

-- AlterTable
ALTER TABLE "ingest"."ingest_lesson" DROP COLUMN "captions_id",
DROP COLUMN "lesson_plan_id";

-- CreateIndex
CREATE INDEX "lesson_summaries_key_stage_id_subject_id_idx" ON "public"."lesson_summaries"("key_stage_id", "subject_id");

-- CreateIndex
CREATE INDEX "snippets_key_stage_id_subject_id_idx" ON "public"."snippets"("key_stage_id", "subject_id");
