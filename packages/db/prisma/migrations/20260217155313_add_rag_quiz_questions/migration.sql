-- CreateTable
CREATE TABLE "rag"."quiz_questions" (
    "id" SERIAL NOT NULL,
    "question_uid" TEXT NOT NULL,
    "lesson_slug" TEXT NOT NULL,
    "subject_slug" TEXT NOT NULL,
    "key_stage_slug" TEXT NOT NULL,
    "quiz_type" TEXT NOT NULL,
    "question_position" INTEGER NOT NULL,
    "raw_json" JSONB NOT NULL,
    "description" TEXT,
    "embedding" vector(768),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_question_uid_key" ON "rag"."quiz_questions"("question_uid");

-- CreateIndex
CREATE INDEX "idx_rag_quiz_questions_lesson_slug" ON "rag"."quiz_questions"("lesson_slug");

-- CreateIndex
CREATE INDEX "idx_rag_quiz_questions_subject_ks" ON "rag"."quiz_questions"("subject_slug", "key_stage_slug");
