-- CreateEnum;
CREATE TYPE "ModerationType" AS ENUM (
    'NOT_ENGLISH',
	'PROFANITY',
	'OPENAI_FLAGGED',
	'OPENAI_OVER_THRESHOLD'
);

-- AlterTable
ALTER TABLE "generations"
	ADD COLUMN "moderation_meta" JSONB,
	ADD COLUMN "moderation_type" "ModerationType";
