/*
  Warnings:

  - Added the required column `message_id` to the `moderations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "moderations" ADD COLUMN     "message_id" TEXT NOT NULL;
