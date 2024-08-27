/*
  Warnings:

  - You are about to drop the `LessonPlanPart` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LessonPlanPart" DROP CONSTRAINT "LessonPlanPart_lesson_plan_id_fkey";

-- DropTable
DROP TABLE "LessonPlanPart";

-- CreateTable
CREATE TABLE "lesson_plan_parts" (
    "id" TEXT NOT NULL,
    "lesson_plan_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "embedding" vector(1536),
    "status" "LessonPlanPartStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "lesson_plan_parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_plan_parts_lesson_plan_id_key_key" ON "lesson_plan_parts"("lesson_plan_id", "key");

-- AddForeignKey
ALTER TABLE "lesson_plan_parts" ADD CONSTRAINT "lesson_plan_parts_lesson_plan_id_fkey" FOREIGN KEY ("lesson_plan_id") REFERENCES "lesson_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
