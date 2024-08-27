/*
  Warnings:

  - You are about to drop the column `winning_id` on the `comparative_judgement_result` table. All the data in the column will be lost.
  - Added the required column `winner_id` to the `comparative_judgement_result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comparative_judgement_result" DROP COLUMN "winning_id",
ADD COLUMN     "winner_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "comparative_judgement_result" ADD CONSTRAINT "comparative_judgement_result_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "answers_and_distractors_for_judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
