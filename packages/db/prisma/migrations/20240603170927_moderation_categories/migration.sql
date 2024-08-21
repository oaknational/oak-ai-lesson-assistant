/*
  Warnings:

  - You are about to drop the column `reason` on the `moderations` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `moderations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "moderations" DROP COLUMN "reason",
DROP COLUMN "severity",
ADD COLUMN     "categories" JSONB[],
ADD COLUMN     "justification" TEXT;

-- DropEnum
DROP TYPE "ModerationSeverity";
