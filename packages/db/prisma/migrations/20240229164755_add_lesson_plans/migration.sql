-- CreateEnum
CREATE TYPE "LessonPlanStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED', 'SUCCESS');

-- CreateTable
CREATE TABLE "lesson_plans" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "content" JSONB,
    "errorMessage" TEXT,
    "embedding" vector(1536),
    "status" "LessonPlanStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "lesson_plans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
