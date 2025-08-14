-- AlterTable
ALTER TABLE "public"."_AppToStatistics" ADD CONSTRAINT "_AppToStatistics_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_AppToStatistics_AB_unique";

-- AlterTable
ALTER TABLE "public"."_PromptToStatistics" ADD CONSTRAINT "_PromptToStatistics_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_PromptToStatistics_AB_unique";
