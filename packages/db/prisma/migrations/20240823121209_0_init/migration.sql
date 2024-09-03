-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "AilaUserFlagType" AS ENUM ('INAPPROPRIATE_CONTENT', 'INACCURATE_CONTENT', 'TOO_HARD', 'TOO_EASY', 'OTHER');

-- CreateEnum
CREATE TYPE "AilaUserModificationAction" AS ENUM ('MAKE_IT_HARDER', 'MAKE_IT_EASIER', 'SHORTEN_CONTENT', 'ADD_MORE_DETAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "SafetyViolationAction" AS ENUM ('CHAT_MESSAGE', 'QUIZ_GENERATION');

-- CreateEnum
CREATE TYPE "SafetyViolationSource" AS ENUM ('HELICONE', 'OPENAI', 'MODERATION');

-- CreateEnum
CREATE TYPE "SafetyViolationRecordType" AS ENUM ('CHAT_SESSION', 'GENERATION', 'MODERATION');

-- CreateEnum
CREATE TYPE "LessonExportType" AS ENUM ('STARTER_QUIZ_DOC', 'EXIT_QUIZ_DOC', 'LESSON_PLAN_DOC', 'LESSON_SLIDES_SLIDES', 'WORKSHEET_SLIDES', 'ADDITIONAL_MATERIALS_DOCS');

-- CreateEnum
CREATE TYPE "LessonSnapshotTrigger" AS ENUM ('EXPORT_BY_USER', 'MODERATION');

-- CreateEnum
CREATE TYPE "FlaggedOrSkipped" AS ENUM ('FLAGGED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "SnippetVariant" AS ENUM ('SENTENCE', 'PARAGRAPH', 'SECTION', 'CHUNK', 'VTT', 'QUESTION_AND_ANSWER');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('REQUESTED', 'PENDING', 'MODERATING', 'GENERATING', 'FAILED', 'SUCCESS', 'FLAGGED');

-- CreateEnum
CREATE TYPE "ModerationType" AS ENUM ('NOT_ENGLISH', 'PROFANITY', 'OPENAI_FLAGGED', 'OPENAI_OVER_THRESHOLD', 'LLM_REFUSAL');

-- CreateEnum
CREATE TYPE "TranscriptVariant" AS ENUM ('ORIGINAL', 'COMPRESSED');

-- CreateEnum
CREATE TYPE "TranscriptStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "SnippetStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "LessonSummaryStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "LessonPlanStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "LessonPlanPartStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "SnippetCompression" AS ENUM ('BREVITY', 'SIMPLIFICATION', 'RELEVANCE');

-- CreateEnum
CREATE TYPE "QuizQuestionStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "QuizAnswerStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "identifier" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "app_id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "variant" TEXT,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "git_sha" TEXT,
    "template" TEXT NOT NULL,
    "input_schema" JSONB NOT NULL,
    "output_schema" JSONB NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_oak_user" BOOLEAN NOT NULL,
    "email_address" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_stages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_stage_subjects" (
    "id" TEXT NOT NULL,
    "key_stage_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "contentAvailable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "key_stage_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_user_flags" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "flag_type" "AilaUserFlagType" NOT NULL,
    "user_comment" TEXT,

    CONSTRAINT "chat_user_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aila_user_modifications" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "action" "AilaUserModificationAction" NOT NULL,

    CONSTRAINT "aila_user_modifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "key_stage" TEXT NOT NULL,
    "key_stage_id" TEXT,
    "subject_id" TEXT,
    "content" JSONB,
    "new_lesson_content" JSONB,
    "captions" JSONB,
    "is_new_lesson" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summarisation_strategies" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "prompt_hash" TEXT NOT NULL,
    "chunk_size" INTEGER,

    CONSTRAINT "summarisation_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_summaries" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "strategy_id" TEXT,
    "content" TEXT,
    "topics" TEXT[],
    "learningObjectives" TEXT[],
    "concepts" TEXT[],
    "keywords" TEXT[],
    "reasoning" TEXT,
    "errorMessage" TEXT,
    "captions" JSONB,
    "subject_id" TEXT,
    "key_stage_id" TEXT,
    "subjectSlug" TEXT,
    "keyStageSlug" TEXT,
    "embedding" vector(1536),
    "status" "LessonSummaryStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,

    CONSTRAINT "lesson_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_plans" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "subject_id" TEXT,
    "key_stage_id" TEXT,
    "content" JSONB,
    "errorMessage" TEXT,
    "embedding" vector(1536),
    "status" "LessonPlanStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "lesson_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_plan_parts" (
    "id" TEXT NOT NULL,
    "lesson_plan_id" TEXT NOT NULL,
    "subject_id" TEXT,
    "key_stage_id" TEXT,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "embedding" vector(1536),
    "status" "LessonPlanPartStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "lesson_plan_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "variant" "TranscriptVariant" NOT NULL DEFAULT 'ORIGINAL',
    "lesson_id" TEXT NOT NULL,
    "content" JSONB,
    "status" "TranscriptStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_sessions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "app_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "output" JSONB,

    CONSTRAINT "app_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_content" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "app_session_id" TEXT NOT NULL,

    CONSTRAINT "shared_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "app_id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "app_session_id" TEXT,
    "user_id" TEXT NOT NULL,
    "status" "GenerationStatus" NOT NULL DEFAULT 'REQUESTED',
    "prompt_inputs" JSONB,
    "prompt_text" TEXT,
    "response" JSONB,
    "llm_time_taken" INTEGER,
    "completed_at" TIMESTAMP(3),
    "error" TEXT,
    "moderation_type" "ModerationType",
    "moderation_meta" JSONB,
    "moderationResults" JSONB,
    "prompt_tokens_used" INTEGER,
    "completion_tokens_used" INTEGER,
    "prompt_inputs_hash" TEXT,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tweaks" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "app_session_id" TEXT,
    "generation_id" TEXT NOT NULL,
    "tweaked_value" JSONB NOT NULL,
    "original_value" JSONB,

    CONSTRAINT "user_tweaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "re_generations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "app_session_id" TEXT,
    "previous_generation_id" TEXT NOT NULL,
    "replacement_generation_id" TEXT NOT NULL,

    CONSTRAINT "re_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_user_flags" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "app_session_id" TEXT,
    "generation_id" TEXT NOT NULL,
    "feedback_message" TEXT,
    "feedback_value" TEXT NOT NULL,
    "feedbackReasons" JSONB NOT NULL,

    CONSTRAINT "generation_user_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snippets" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "transcript_id" TEXT,
    "question_id" TEXT,
    "index" INTEGER,
    "variant" "SnippetVariant" NOT NULL DEFAULT 'SENTENCE',
    "timestamp" INTEGER,
    "source_content" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "compression" "SnippetCompression",
    "status" "SnippetStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "key_stage_slug" TEXT,
    "subject_slug" TEXT,
    "key_stage_id" TEXT,
    "subject_id" TEXT,

    CONSTRAINT "snippets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "original_question_id" INTEGER NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "embedding" vector(1536),
    "status" "QuizQuestionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "question_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "distractor" BOOLEAN NOT NULL DEFAULT false,
    "embedding" vector(1536),
    "status" "QuizAnswerStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "app_id" TEXT,
    "prompt_id" TEXT,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions_for_judgement" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "quiz_question_id" TEXT,
    "subject_id" TEXT NOT NULL,
    "key_stage_id" TEXT NOT NULL,

    CONSTRAINT "questions_for_judgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers_and_distractors_for_judgement" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "quiz_question_id" TEXT,
    "answer_and_distractor" JSONB NOT NULL,
    "is_oak_question" BOOLEAN,
    "prompt_id" TEXT,

    CONSTRAINT "answers_and_distractors_for_judgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparative_judgements" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "question_for_judgement_id" TEXT NOT NULL,
    "option_a_id" TEXT NOT NULL,
    "option_b_id" TEXT NOT NULL,

    CONSTRAINT "comparative_judgements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparative_judgement_results" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "judgement_id" TEXT NOT NULL,
    "winner_id" TEXT,
    "user_id" TEXT NOT NULL,
    "flagged_or_skipped" "FlaggedOrSkipped",
    "decision_reason" TEXT,

    CONSTRAINT "comparative_judgement_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparative_judgement_flags" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "flagged_judgement_id" TEXT NOT NULL,
    "flagged_answer_and_distractor_id" TEXT NOT NULL,
    "feedback_message" TEXT,
    "feedbackReasons" JSONB NOT NULL,

    CONSTRAINT "comparative_judgement_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lesson_slug" TEXT NOT NULL,
    "download" JSONB NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_allowed_to_view_new_features" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_address" TEXT NOT NULL,

    CONSTRAINT "users_allowed_to_view_new_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_export_downloads" (
    "id" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "lesson_export_id" TEXT NOT NULL,
    "downloaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_export_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qd_export_downloads" (
    "id" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "qd_export_id" TEXT NOT NULL,
    "downloaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qd_export_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qd_exports" (
    "id" TEXT NOT NULL,
    "lesson_snapshot_id" TEXT NOT NULL,
    "export_type" "LessonExportType" NOT NULL,
    "template_gdrive_file_id" TEXT NOT NULL,
    "gdrive_file_id" TEXT NOT NULL,
    "gdrive_file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3),
    "user_can_view_gdrive_file" BOOLEAN NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "qd_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qd_snapshots" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "qd_json" JSONB NOT NULL,
    "hash" TEXT NOT NULL,
    "trigger" "LessonSnapshotTrigger" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "qd_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_exports" (
    "id" TEXT NOT NULL,
    "lesson_snapshot_id" TEXT NOT NULL,
    "export_type" "LessonExportType" NOT NULL,
    "template_gdrive_file_id" TEXT NOT NULL,
    "gdrive_file_id" TEXT NOT NULL,
    "gdrive_file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3),
    "user_can_view_gdrive_file" BOOLEAN NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "lesson_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_snapshots" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "lesson_json" JSONB NOT NULL,
    "lesson_schema_id" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "trigger" "LessonSnapshotTrigger" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "lesson_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "app_session_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "categories" JSONB[],
    "justification" TEXT,
    "lesson_snapshot_id" TEXT,
    "user_comment" TEXT,

    CONSTRAINT "moderations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_schemas" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "json_schema" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_violations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_action" "SafetyViolationAction" NOT NULL,
    "detection_source" "SafetyViolationSource" NOT NULL,
    "record_type" "SafetyViolationRecordType" NOT NULL,
    "record_id" TEXT NOT NULL,

    CONSTRAINT "policy_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppToStatistics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PromptToStatistics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "apps_slug_key" ON "apps"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "prompts_hash_key" ON "prompts"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "key_stages_slug_key" ON "key_stages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "key_stage_subjects_key_stage_id_subject_id_key" ON "key_stage_subjects"("key_stage_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_plan_parts_lesson_plan_id_key_key" ON "lesson_plan_parts"("lesson_plan_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "transcripts_lesson_id_variant_key" ON "transcripts"("lesson_id", "variant");

-- CreateIndex
CREATE INDEX "generations_prompt_inputs_hash_prompt_id_status_idx" ON "generations"("prompt_inputs_hash", "prompt_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "snippets_lesson_id_transcript_id_index_compression_variant_key" ON "snippets"("lesson_id", "transcript_id", "index", "compression", "variant");

-- CreateIndex
CREATE UNIQUE INDEX "questions_original_question_id_key" ON "questions"("original_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "answers_lesson_id_question_id_answer_key" ON "answers"("lesson_id", "question_id", "answer");

-- CreateIndex
CREATE UNIQUE INDEX "statistics_name_app_id_prompt_id_key" ON "statistics"("name", "app_id", "prompt_id");

-- CreateIndex
CREATE INDEX "idx_qd_user_grdive_file_id" ON "qd_exports"("user_id", "gdrive_file_id");

-- CreateIndex
CREATE INDEX "idx_qd_user_session_hash" ON "qd_snapshots"("user_id", "session_id", "hash");

-- CreateIndex
CREATE INDEX "idx_user_grdive_file_id" ON "lesson_exports"("user_id", "gdrive_file_id");

-- CreateIndex
CREATE INDEX "idx_user_chat_hash" ON "lesson_snapshots"("user_id", "chat_id", "hash");

-- CreateIndex
CREATE INDEX "lesson_schemas_hash_idx" ON "lesson_schemas"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "_AppToStatistics_AB_unique" ON "_AppToStatistics"("A", "B");

-- CreateIndex
CREATE INDEX "_AppToStatistics_B_index" ON "_AppToStatistics"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PromptToStatistics_AB_unique" ON "_PromptToStatistics"("A", "B");

-- CreateIndex
CREATE INDEX "_PromptToStatistics_B_index" ON "_PromptToStatistics"("B");

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
ALTER TABLE "lesson_summaries" ADD CONSTRAINT "lesson_summaries_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_summaries" ADD CONSTRAINT "lesson_summaries_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan_parts" ADD CONSTRAINT "lesson_plan_parts_lesson_plan_id_fkey" FOREIGN KEY ("lesson_plan_id") REFERENCES "lesson_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan_parts" ADD CONSTRAINT "lesson_plan_parts_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan_parts" ADD CONSTRAINT "lesson_plan_parts_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions_for_judgement" ADD CONSTRAINT "questions_for_judgement_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions_for_judgement" ADD CONSTRAINT "questions_for_judgement_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions_for_judgement" ADD CONSTRAINT "questions_for_judgement_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers_and_distractors_for_judgement" ADD CONSTRAINT "answers_and_distractors_for_judgement_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers_and_distractors_for_judgement" ADD CONSTRAINT "answers_and_distractors_for_judgement_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgements" ADD CONSTRAINT "comparative_judgements_question_for_judgement_id_fkey" FOREIGN KEY ("question_for_judgement_id") REFERENCES "questions_for_judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgements" ADD CONSTRAINT "comparative_judgements_option_a_id_fkey" FOREIGN KEY ("option_a_id") REFERENCES "answers_and_distractors_for_judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgements" ADD CONSTRAINT "comparative_judgements_option_b_id_fkey" FOREIGN KEY ("option_b_id") REFERENCES "answers_and_distractors_for_judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement_results" ADD CONSTRAINT "comparative_judgement_results_judgement_id_fkey" FOREIGN KEY ("judgement_id") REFERENCES "comparative_judgements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement_results" ADD CONSTRAINT "comparative_judgement_results_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "answers_and_distractors_for_judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement_flags" ADD CONSTRAINT "comparative_judgement_flags_flagged_judgement_id_fkey" FOREIGN KEY ("flagged_judgement_id") REFERENCES "comparative_judgements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement_flags" ADD CONSTRAINT "comparative_judgement_flags_flagged_answer_and_distractor__fkey" FOREIGN KEY ("flagged_answer_and_distractor_id") REFERENCES "answers_and_distractors_for_judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_lesson_slug_fkey" FOREIGN KEY ("lesson_slug") REFERENCES "lessons"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_export_downloads" ADD CONSTRAINT "lesson_export_downloads_lesson_export_id_fkey" FOREIGN KEY ("lesson_export_id") REFERENCES "lesson_exports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qd_export_downloads" ADD CONSTRAINT "qd_export_downloads_qd_export_id_fkey" FOREIGN KEY ("qd_export_id") REFERENCES "qd_exports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qd_exports" ADD CONSTRAINT "qd_exports_lesson_snapshot_id_fkey" FOREIGN KEY ("lesson_snapshot_id") REFERENCES "qd_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_exports" ADD CONSTRAINT "lesson_exports_lesson_snapshot_id_fkey" FOREIGN KEY ("lesson_snapshot_id") REFERENCES "lesson_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_snapshots" ADD CONSTRAINT "lesson_snapshots_lesson_schema_id_fkey" FOREIGN KEY ("lesson_schema_id") REFERENCES "lesson_schemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderations" ADD CONSTRAINT "moderations_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderations" ADD CONSTRAINT "moderations_lesson_snapshot_id_fkey" FOREIGN KEY ("lesson_snapshot_id") REFERENCES "lesson_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppToStatistics" ADD CONSTRAINT "_AppToStatistics_A_fkey" FOREIGN KEY ("A") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppToStatistics" ADD CONSTRAINT "_AppToStatistics_B_fkey" FOREIGN KEY ("B") REFERENCES "statistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptToStatistics" ADD CONSTRAINT "_PromptToStatistics_A_fkey" FOREIGN KEY ("A") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptToStatistics" ADD CONSTRAINT "_PromptToStatistics_B_fkey" FOREIGN KEY ("B") REFERENCES "statistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
