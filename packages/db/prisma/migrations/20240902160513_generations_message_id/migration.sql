/*
  Warnings:

  - Made the column `feedback_message` on table `generation_user_flags` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "generation_user_flags" ALTER COLUMN "feedback_message" SET NOT NULL;

-- AlterTable
ALTER TABLE "generations" ADD COLUMN     "message_id" TEXT;
