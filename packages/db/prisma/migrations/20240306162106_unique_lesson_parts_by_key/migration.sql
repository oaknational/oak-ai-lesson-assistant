/*
  Warnings:

  - A unique constraint covering the columns `[lesson_plan_id,key]` on the table `LessonPlanPart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LessonPlanPart_lesson_plan_id_key_key" ON "LessonPlanPart"("lesson_plan_id", "key");
