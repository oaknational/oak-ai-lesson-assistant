/*
  Warnings:

  - You are about to drop the `answers_and_distractors_for_judgement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comparative_judgement_flags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comparative_judgement_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comparative_judgements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions_for_judgement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."answers_and_distractors_for_judgement" DROP CONSTRAINT "answers_and_distractors_for_judgement_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."answers_and_distractors_for_judgement" DROP CONSTRAINT "answers_and_distractors_for_judgement_quiz_question_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comparative_judgement_flags" DROP CONSTRAINT "comparative_judgement_flags_flagged_answer_and_distractor__fkey";

-- DropForeignKey
ALTER TABLE "public"."comparative_judgement_flags" DROP CONSTRAINT "comparative_judgement_flags_flagged_judgement_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comparative_judgement_results" DROP CONSTRAINT "comparative_judgement_results_judgement_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comparative_judgement_results" DROP CONSTRAINT "comparative_judgement_results_winner_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comparative_judgements" DROP CONSTRAINT "comparative_judgements_option_a_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comparative_judgements" DROP CONSTRAINT "comparative_judgements_option_b_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comparative_judgements" DROP CONSTRAINT "comparative_judgements_question_for_judgement_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."questions_for_judgement" DROP CONSTRAINT "questions_for_judgement_key_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."questions_for_judgement" DROP CONSTRAINT "questions_for_judgement_quiz_question_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."questions_for_judgement" DROP CONSTRAINT "questions_for_judgement_subject_id_fkey";

-- DropTable
DROP TABLE "public"."answers_and_distractors_for_judgement";

-- DropTable
DROP TABLE "public"."comparative_judgement_flags";

-- DropTable
DROP TABLE "public"."comparative_judgement_results";

-- DropTable
DROP TABLE "public"."comparative_judgements";

-- DropTable
DROP TABLE "public"."questions_for_judgement";

-- DropEnum
DROP TYPE "public"."FlaggedOrSkipped";
