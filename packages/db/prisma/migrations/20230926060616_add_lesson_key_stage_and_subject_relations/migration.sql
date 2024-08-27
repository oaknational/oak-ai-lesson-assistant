-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "key_stage_id" TEXT,
ADD COLUMN     "subject_id" TEXT;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
