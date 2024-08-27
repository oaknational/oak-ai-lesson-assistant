/*
  Warnings:

  - A unique constraint covering the columns `[lesson_id,question_id,answer]` on the table `answers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "answers_lesson_id_answer_key";

-- CreateIndex
CREATE UNIQUE INDEX "answers_lesson_id_question_id_answer_key" ON "answers"("lesson_id", "question_id", "answer");
