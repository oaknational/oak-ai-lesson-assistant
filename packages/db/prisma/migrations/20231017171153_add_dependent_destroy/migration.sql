-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "app_sessions" DROP CONSTRAINT "app_sessions_app_id_fkey";

-- DropForeignKey
ALTER TABLE "generation_user_flags" DROP CONSTRAINT "generation_user_flags_app_session_id_fkey";

-- DropForeignKey
ALTER TABLE "generation_user_flags" DROP CONSTRAINT "generation_user_flags_generation_id_fkey";

-- DropForeignKey
ALTER TABLE "generations" DROP CONSTRAINT "generations_app_id_fkey";

-- DropForeignKey
ALTER TABLE "generations" DROP CONSTRAINT "generations_app_session_id_fkey";

-- DropForeignKey
ALTER TABLE "generations" DROP CONSTRAINT "generations_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "key_stage_subjects" DROP CONSTRAINT "key_stage_subjects_key_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "key_stage_subjects" DROP CONSTRAINT "key_stage_subjects_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_summaries" DROP CONSTRAINT "lesson_summaries_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_summaries" DROP CONSTRAINT "lesson_summaries_strategy_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_key_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "prompts" DROP CONSTRAINT "prompts_app_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "re_generations" DROP CONSTRAINT "re_generations_app_session_id_fkey";

-- DropForeignKey
ALTER TABLE "re_generations" DROP CONSTRAINT "re_generations_previous_generation_id_fkey";

-- DropForeignKey
ALTER TABLE "re_generations" DROP CONSTRAINT "re_generations_replacement_generation_id_fkey";

-- DropForeignKey
ALTER TABLE "snippets" DROP CONSTRAINT "snippets_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "snippets" DROP CONSTRAINT "snippets_transcript_id_fkey";

-- DropForeignKey
ALTER TABLE "transcripts" DROP CONSTRAINT "transcripts_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "user_tweaks" DROP CONSTRAINT "user_tweaks_app_session_id_fkey";

-- DropForeignKey
ALTER TABLE "user_tweaks" DROP CONSTRAINT "user_tweaks_generation_id_fkey";

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_stage_subjects" ADD CONSTRAINT "key_stage_subjects_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_stage_subjects" ADD CONSTRAINT "key_stage_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_summaries" ADD CONSTRAINT "lesson_summaries_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_summaries" ADD CONSTRAINT "lesson_summaries_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "summarisation_strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tweaks" ADD CONSTRAINT "user_tweaks_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tweaks" ADD CONSTRAINT "user_tweaks_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "re_generations" ADD CONSTRAINT "re_generations_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "re_generations" ADD CONSTRAINT "re_generations_previous_generation_id_fkey" FOREIGN KEY ("previous_generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "re_generations" ADD CONSTRAINT "re_generations_replacement_generation_id_fkey" FOREIGN KEY ("replacement_generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_user_flags" ADD CONSTRAINT "generation_user_flags_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_user_flags" ADD CONSTRAINT "generation_user_flags_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "transcripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
