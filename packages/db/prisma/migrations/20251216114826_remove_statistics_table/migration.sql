/*
  Warnings:

  - You are about to drop the `_AppToStatistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PromptToStatistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statistics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_AppToStatistics" DROP CONSTRAINT "_AppToStatistics_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AppToStatistics" DROP CONSTRAINT "_AppToStatistics_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PromptToStatistics" DROP CONSTRAINT "_PromptToStatistics_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PromptToStatistics" DROP CONSTRAINT "_PromptToStatistics_B_fkey";

-- DropTable
DROP TABLE "public"."_AppToStatistics";

-- DropTable
DROP TABLE "public"."_PromptToStatistics";

-- DropTable
DROP TABLE "public"."statistics";
