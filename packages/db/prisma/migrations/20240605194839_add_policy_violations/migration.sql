-- CreateEnum
CREATE TYPE "SafetyViolationAction" AS ENUM ('CHAT_MESSAGE', 'QUIZ_GENERATION');

-- CreateEnum
CREATE TYPE "SafetyViolationSource" AS ENUM ('HELICONE', 'OPENAI');

-- CreateEnum
CREATE TYPE "SafetyViolationRecordType" AS ENUM ('CHAT_SESSION', 'GENERATION');

-- CreateTable
CREATE TABLE "policy_violations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_action" "SafetyViolationAction" NOT NULL,
    "detection_source" "SafetyViolationSource" NOT NULL,
    "record_type" "SafetyViolationRecordType" NOT NULL,
    "record_id" TEXT NOT NULL,
    CONSTRAINT "policy_violations_pkey" PRIMARY KEY ("id")
);
