/*
  Warnings:

  - A unique constraint covering the columns `[key_stage_id,subject_id]` on the table `key_stage_subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "key_stage_subjects_key_stage_id_subject_id_key" ON "key_stage_subjects"("key_stage_id", "subject_id");
