/*
  Warnings:

  - You are about to drop the column `raw_content` on the `transcripts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lesson_id,transcript_id,index,compression,variant]` on the table `snippets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `source_content` to the `snippets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateEnum
CREATE TYPE "TranscriptStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "SnippetStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "LessonSummaryStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "SnippetCompression" AS ENUM ('BREVITY', 'SIMPLIFICATION', 'RELEVANCE');

-- AlterEnum
ALTER TYPE "SnippetVariant" ADD VALUE 'VTT';

-- DropForeignKey
ALTER TABLE "lesson_summaries" DROP CONSTRAINT "lesson_summaries_strategy_id_fkey";

-- AlterTable
ALTER TABLE "lesson_summaries" ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "error" TEXT,
ADD COLUMN     "status" "LessonSummaryStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "strategy_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "captions" JSONB;

-- AlterTable
ALTER TABLE "snippets" ADD COLUMN     "compression" "SnippetCompression",
ADD COLUMN     "source_content" TEXT NOT NULL,
ADD COLUMN     "status" "SnippetStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "transcripts" DROP COLUMN "raw_content",
ADD COLUMN     "status" "TranscriptStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "embedding" vector(1536),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "distractor" BOOLEAN NOT NULL DEFAULT false,
    "embedding" vector(1536),

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_lesson_id_question_key" ON "questions"("lesson_id", "question");

-- CreateIndex
CREATE UNIQUE INDEX "answers_lesson_id_answer_key" ON "answers"("lesson_id", "answer");

-- CreateIndex
CREATE UNIQUE INDEX "snippets_lesson_id_transcript_id_index_compression_variant_key" ON "snippets"("lesson_id", "transcript_id", "index", "compression", "variant");

-- AddForeignKey
ALTER TABLE "lesson_summaries" ADD CONSTRAINT "lesson_summaries_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "summarisation_strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
