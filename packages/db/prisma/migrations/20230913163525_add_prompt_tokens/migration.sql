-- AlterTable
ALTER TABLE "generations" ADD COLUMN     "completion_tokens_used" INTEGER,
ADD COLUMN     "prompt_tokens_used" INTEGER;
