/*
  Warnings:

  - You are about to drop the `AilaUserFlag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AilaUserFlag" DROP CONSTRAINT "AilaUserFlag_app_session_id_fkey";

-- DropForeignKey
ALTER TABLE "AilaUserFlag" DROP CONSTRAINT "AilaUserFlag_flagged_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "AilaUserFlag" DROP CONSTRAINT "AilaUserFlag_lesson_snapshot_id_fkey";

-- DropTable
DROP TABLE "AilaUserFlag";
