/*
  Warnings:

  - You are about to drop the column `cleanQuizQuestionId` on the `answers_and_distractors_for_judgment` table. All the data in the column will be lost.
  - You are about to drop the column `option_type` on the `answers_and_distractors_for_judgment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "answers_and_distractors_for_judgment" DROP COLUMN "cleanQuizQuestionId",
DROP COLUMN "option_type",
ADD COLUMN     "is_oak_question" BOOLEAN,
ADD COLUMN     "prompt_id" TEXT;

-- DropEnum
DROP TYPE "ComparativeJudgementOption";

-- AddForeignKey
ALTER TABLE "answers_and_distractors_for_judgment" ADD CONSTRAINT "answers_and_distractors_for_judgment_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
