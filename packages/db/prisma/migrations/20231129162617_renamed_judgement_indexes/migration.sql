-- AlterTable
ALTER TABLE "comparative_judgement_flags" RENAME CONSTRAINT "comparative_judgement_flag_pkey" TO "comparative_judgement_flags_pkey";

-- AlterTable
ALTER TABLE "comparative_judgement_results" RENAME CONSTRAINT "comparative_judgement_result_pkey" TO "comparative_judgement_results_pkey";

-- AlterTable
ALTER TABLE "comparative_judgements" RENAME CONSTRAINT "comparative_judgement_pkey" TO "comparative_judgements_pkey";

-- RenameForeignKey
ALTER TABLE "comparative_judgement_flags" RENAME CONSTRAINT "comparative_judgement_flag_flagged_answer_and_distractor_i_fkey" TO "comparative_judgement_flags_flagged_answer_and_distractor__fkey";

-- RenameForeignKey
ALTER TABLE "comparative_judgement_flags" RENAME CONSTRAINT "comparative_judgement_flag_flagged_judgement_id_fkey" TO "comparative_judgement_flags_flagged_judgement_id_fkey";

-- RenameForeignKey
ALTER TABLE "comparative_judgement_results" RENAME CONSTRAINT "comparative_judgement_result_judgement_id_fkey" TO "comparative_judgement_results_judgement_id_fkey";

-- RenameForeignKey
ALTER TABLE "comparative_judgement_results" RENAME CONSTRAINT "comparative_judgement_result_winner_id_fkey" TO "comparative_judgement_results_winner_id_fkey";

-- RenameForeignKey
ALTER TABLE "comparative_judgements" RENAME CONSTRAINT "comparative_judgement_option_a_id_fkey" TO "comparative_judgements_option_a_id_fkey";

-- RenameForeignKey
ALTER TABLE "comparative_judgements" RENAME CONSTRAINT "comparative_judgement_option_b_id_fkey" TO "comparative_judgements_option_b_id_fkey";

-- RenameForeignKey
ALTER TABLE "comparative_judgements" RENAME CONSTRAINT "comparative_judgement_question_for_judgment_id_fkey" TO "comparative_judgements_question_for_judgment_id_fkey";
