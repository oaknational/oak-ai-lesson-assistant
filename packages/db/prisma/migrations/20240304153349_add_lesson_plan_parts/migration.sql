-- CreateTable
CREATE TABLE "LessonPlanPart" (
    "id" TEXT NOT NULL,
    "lesson_plan_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "embedding" vector(1536),

    CONSTRAINT "LessonPlanPart_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LessonPlanPart" ADD CONSTRAINT "LessonPlanPart_lesson_plan_id_fkey" FOREIGN KEY ("lesson_plan_id") REFERENCES "lesson_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
