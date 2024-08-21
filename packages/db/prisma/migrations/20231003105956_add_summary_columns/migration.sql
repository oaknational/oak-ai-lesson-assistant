/*
  Warnings:

  - A unique constraint covering the columns `[original_question_id]` on the table `questions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lesson_id,variant]` on the table `transcripts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `original_question_id` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "questions_lesson_id_question_key";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "original_question_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "questions_original_question_id_key" ON "questions"("original_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "transcripts_lesson_id_variant_key" ON "transcripts"("lesson_id", "variant");
