-- CreateEnum
CREATE TYPE "ComparativeJudgementOption" AS ENUM ('AI_QUESTION', 'OAK_QUESTION');

-- CreateEnum
CREATE TYPE "FlaggedOrSkipped" AS ENUM ('FLAGGED', 'SKIPPED');

-- CreateTable
CREATE TABLE "questions_for_judgment" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "quiz_question_id" TEXT,
    "subject_id" TEXT NOT NULL,
    "key_stage_id" TEXT NOT NULL,
    "cleanQuizQuestionId" TEXT,

    CONSTRAINT "questions_for_judgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers_and_distractors_for_judgment" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "quiz_question_id" TEXT,
    "answer_and_distractor" JSONB NOT NULL,
    "option_type" "ComparativeJudgementOption" NOT NULL,
    "cleanQuizQuestionId" TEXT,

    CONSTRAINT "answers_and_distractors_for_judgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparative_judgement" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "question_for_judgment_id" TEXT NOT NULL,
    "option_a_id" TEXT NOT NULL,
    "option_b_id" TEXT NOT NULL,

    CONSTRAINT "comparative_judgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparative_judgement_result" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "judgement_id" TEXT NOT NULL,
    "winning_id" TEXT,
    "user_id" TEXT NOT NULL,
    "flagged_or_skipped" "FlaggedOrSkipped",
    "decision_reason" TEXT,

    CONSTRAINT "comparative_judgement_result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "questions_for_judgment" ADD CONSTRAINT "questions_for_judgment_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions_for_judgment" ADD CONSTRAINT "questions_for_judgment_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions_for_judgment" ADD CONSTRAINT "questions_for_judgment_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers_and_distractors_for_judgment" ADD CONSTRAINT "answers_and_distractors_for_judgment_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement" ADD CONSTRAINT "comparative_judgement_question_for_judgment_id_fkey" FOREIGN KEY ("question_for_judgment_id") REFERENCES "questions_for_judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement" ADD CONSTRAINT "comparative_judgement_option_a_id_fkey" FOREIGN KEY ("option_a_id") REFERENCES "answers_and_distractors_for_judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement" ADD CONSTRAINT "comparative_judgement_option_b_id_fkey" FOREIGN KEY ("option_b_id") REFERENCES "answers_and_distractors_for_judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement_result" ADD CONSTRAINT "comparative_judgement_result_judgement_id_fkey" FOREIGN KEY ("judgement_id") REFERENCES "comparative_judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
