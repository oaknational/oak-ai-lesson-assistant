-- AlterTable
ALTER TABLE "chat_user_flags" ADD COLUMN     "section_path" TEXT,
ADD COLUMN     "section_value" JSONB;
