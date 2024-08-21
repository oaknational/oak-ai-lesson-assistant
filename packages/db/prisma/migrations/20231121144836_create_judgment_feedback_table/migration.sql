-- AlterTable
ALTER TABLE "comparative_judgement_result" ALTER COLUMN "winner_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "comparative_judgement_flag" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "flagged_judgement_id" TEXT NOT NULL,
    "flagged_answer_and_distractor_id" TEXT NOT NULL,
    "feedback_message" TEXT NOT NULL,
    "feedbackReasons" JSONB NOT NULL,

    CONSTRAINT "comparative_judgement_flag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comparative_judgement_flag" ADD CONSTRAINT "comparative_judgement_flag_flagged_judgement_id_fkey" FOREIGN KEY ("flagged_judgement_id") REFERENCES "comparative_judgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_judgement_flag" ADD CONSTRAINT "comparative_judgement_flag_flagged_answer_and_distractor_i_fkey" FOREIGN KEY ("flagged_answer_and_distractor_id") REFERENCES "answers_and_distractors_for_judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
