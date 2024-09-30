-- AlterTable
ALTER TABLE "aila_user_modifications" ADD COLUMN     "action_other_text" TEXT,
ADD COLUMN     "section_path" TEXT,
ADD COLUMN     "section_value" JSONB,
ALTER COLUMN "text_for_mod" DROP NOT NULL;
