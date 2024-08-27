-- CreateEnum
CREATE TYPE "AilaUserFlagType" AS ENUM ('INAPPROPRIATE_CONTENT', 'INACCURATE_CONTENT', 'TOO_HARD', 'TOO_EASY', 'OTHER');

-- CreateEnum
CREATE TYPE "AilaUserModificationAction" AS ENUM ('MAKE_IT_HARDER', 'MAKE_IT_EASIER', 'SHORTEN_CONTENT', 'ADD_MORE_DETAIL', 'OTHER');

-- DropForeignKey
ALTER TABLE "generations" DROP CONSTRAINT "generations_app_id_fkey";

-- DropForeignKey
ALTER TABLE "generations" DROP CONSTRAINT "generations_app_session_id_fkey";

-- DropForeignKey
ALTER TABLE "generations" DROP CONSTRAINT "generations_prompt_id_fkey";

-- CreateTable
CREATE TABLE "chat_user_flags" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "flag_type" "AilaUserFlagType" NOT NULL,
    "user_comment" TEXT,

    CONSTRAINT "chat_user_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aila_user_modifications" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "action" "AilaUserModificationAction" NOT NULL,

    CONSTRAINT "aila_user_modifications_pkey" PRIMARY KEY ("id")
);
