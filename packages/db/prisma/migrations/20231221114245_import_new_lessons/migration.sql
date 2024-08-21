-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "is_2023_lesson" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "newLessonContent" JSONB,
ALTER COLUMN "content" DROP NOT NULL;
