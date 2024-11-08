/*
  Warnings:

  - You are about to drop the column `data` on the `ingest_lesson_plan_part` table. All the data in the column will be lost.
  - You are about to drop the column `valueText` on the `ingest_lesson_plan_part` table. All the data in the column will be lost.
  - Added the required column `value_json` to the `ingest_lesson_plan_part` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value_text` to the `ingest_lesson_plan_part` table without a default value. This is not possible if the table is not empty.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "rag";

-- AlterTable -- updated this to be RENAME instead of DROP and ADD
ALTER TABLE "ingest"."ingest_lesson_plan_part"
  RENAME COLUMN data TO value_json;

ALTER TABLE "ingest"."ingest_lesson_plan_part"
  RENAME COLUMN "valueText" TO value_text;

-- CreateTable
CREATE TABLE "rag"."rag_lesson_plans" (
    "id" TEXT NOT NULL,
    "oak_lesson_id" INTEGER NOT NULL,
    "ingest_lesson_id" TEXT,
    "lesson_plan" JSONB NOT NULL,
    "subject_slug" TEXT NOT NULL,
    "key_stage_slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_lesson_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag"."rag_lesson_plan_parts" (
    "id" TEXT NOT NULL,
    "rag_lesson_plan_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value_text" TEXT NOT NULL,
    "value_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "embedding" vector(256) NOT NULL,

    CONSTRAINT "rag_lesson_plan_parts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rag"."rag_lesson_plan_parts" ADD CONSTRAINT "rag_lesson_plan_parts_rag_lesson_plan_id_fkey" FOREIGN KEY ("rag_lesson_plan_id") REFERENCES "rag"."rag_lesson_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
