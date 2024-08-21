-- AlterTable
ALTER TABLE "questions_for_judgement" RENAME CONSTRAINT "questions_for_judgment_pkey" TO "questions_for_judgement_pkey";

-- RenameForeignKey
ALTER TABLE "questions_for_judgement" RENAME CONSTRAINT "questions_for_judgment_key_stage_id_fkey" TO "questions_for_judgement_key_stage_id_fkey";

-- RenameForeignKey
ALTER TABLE "questions_for_judgement" RENAME CONSTRAINT "questions_for_judgment_quiz_question_id_fkey" TO "questions_for_judgement_quiz_question_id_fkey";

-- RenameForeignKey
ALTER TABLE "questions_for_judgement" RENAME CONSTRAINT "questions_for_judgment_subject_id_fkey" TO "questions_for_judgement_subject_id_fkey";
