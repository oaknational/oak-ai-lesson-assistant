-- AlterTable
ALTER TABLE "lesson_plan_parts" ADD COLUMN     "key_stage_id" TEXT,
ADD COLUMN     "subject_id" TEXT;

-- AlterTable
ALTER TABLE "lesson_plans" ADD COLUMN     "key_stage_id" TEXT,
ADD COLUMN     "subject_id" TEXT;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan_parts" ADD CONSTRAINT "lesson_plan_parts_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan_parts" ADD CONSTRAINT "lesson_plan_parts_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
