-- DropIndex
DROP INDEX "prompts_slug_key";

-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "current" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hash" TEXT,
ADD COLUMN     "variant" TEXT;
