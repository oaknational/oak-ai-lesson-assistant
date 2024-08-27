/*
  Warnings:

  - Made the column `feedback_value` on table `generation_user_flags` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "QuizQuestionStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "QuizAnswerStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "status" "QuizAnswerStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "generation_user_flags" ALTER COLUMN "feedback_value" SET NOT NULL;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "status" "QuizQuestionStatus" NOT NULL DEFAULT 'PENDING';
