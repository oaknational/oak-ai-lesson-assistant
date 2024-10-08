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
