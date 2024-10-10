-- CreateIndex
CREATE INDEX "lesson_summaries_key_stage_id_subject_id_idx" ON "public"."lesson_summaries"("key_stage_id", "subject_id");

-- CreateIndex
CREATE INDEX "snippets_key_stage_id_subject_id_idx" ON "public"."snippets"("key_stage_id", "subject_id");
