-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "SnippetVariant" AS ENUM ('SENTENCE', 'PARAGRAPH', 'SECTION', 'CHUNK');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "TranscriptVariant" AS ENUM ('ORIGINAL', 'COMPRESSED');

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "key_stage" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summarisation_strategies" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "prompt_hash" TEXT NOT NULL,
    "chunk_size" INTEGER,

    CONSTRAINT "summarisation_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_summaries" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "content" TEXT,
    "captions" JSONB,

    CONSTRAINT "lesson_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "variant" "TranscriptVariant" NOT NULL DEFAULT 'ORIGINAL',
    "lesson_id" TEXT NOT NULL,
    "raw_content" TEXT NOT NULL,
    "content" JSONB,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "app_id" TEXT,
    "user_id" TEXT NOT NULL,
    "status" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
    "prompt" TEXT,
    "response" JSONB,
    "duration" INTEGER,
    "error" TEXT,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snippets" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "transcript_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "variant" "SnippetVariant" NOT NULL DEFAULT 'SENTENCE',
    "timestamp" INTEGER,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snippets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apps_slug_key" ON "apps"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- AddForeignKey
ALTER TABLE "lesson_summaries" ADD CONSTRAINT "lesson_summaries_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_summaries" ADD CONSTRAINT "lesson_summaries_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "summarisation_strategies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "transcripts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

