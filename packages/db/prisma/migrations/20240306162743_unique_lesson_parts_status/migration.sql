-- CreateEnum
CREATE TYPE "LessonPlanPartStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED', 'SUCCESS');

-- AlterTable
ALTER TABLE "LessonPlanPart" ADD COLUMN     "status" "LessonPlanPartStatus" NOT NULL DEFAULT 'PENDING';
