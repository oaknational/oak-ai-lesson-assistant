-- AlterEnum
ALTER TYPE "SnippetVariant" ADD VALUE 'QUESTION_AND_ANSWER';

-- AlterTable
ALTER TABLE "snippets" ADD COLUMN     "question_id" TEXT;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
