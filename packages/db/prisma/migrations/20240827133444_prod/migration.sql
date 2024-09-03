/*
  Warnings:

  - Made the column `feedback_message` on table `comparative_judgement_flags` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "comparative_judgement_flags" ALTER COLUMN "feedback_message" SET NOT NULL;
