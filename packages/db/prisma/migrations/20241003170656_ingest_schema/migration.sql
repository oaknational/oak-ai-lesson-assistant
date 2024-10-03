-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ingest";

-- CreateTable
CREATE TABLE "ingest"."ingest" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ingest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."ingest_lesson" (
    "id" TEXT NOT NULL,
    "oak_lesson_id" INTEGER NOT NULL,
    "ingest_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "data_hash" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "step_status" TEXT NOT NULL,
    "captions_id" TEXT,
    "lesson_plan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingest_lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."ingest_lesson_captions" (
    "id" TEXT NOT NULL,
    "ingest_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "data_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingest_lesson_captions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."ingest_lesson_plan" (
    "id" TEXT NOT NULL,
    "ingest_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingest_lesson_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."ingest_lesson_plan_part" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "lesson_plan_id" TEXT NOT NULL,
    "ingest_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "valueText" TEXT NOT NULL,
    "embedding" vector(256),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingest_lesson_plan_part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."ingest_openai_batch" (
    "id" TEXT NOT NULL,
    "ingest_id" TEXT NOT NULL,
    "input_file_path" TEXT NOT NULL,
    "output_file_id" TEXT,
    "error_file_id" TEXT,
    "openai_batch_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMP(3),
    "error_message" TEXT,
    "batch_type" TEXT NOT NULL,

    CONSTRAINT "ingest_openai_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingest"."ingest_error" (
    "id" TEXT NOT NULL,
    "ingest_id" TEXT NOT NULL,
    "lesson_id" TEXT,
    "step" TEXT NOT NULL,
    "error_message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingest_error_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ingest_lesson_captions_id_key" ON "ingest"."ingest_lesson"("captions_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingest_lesson_captions_lesson_id_key" ON "ingest"."ingest_lesson_captions"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingest_lesson_plan_lesson_id_key" ON "ingest"."ingest_lesson_plan"("lesson_id");

-- AddForeignKey
ALTER TABLE "ingest"."ingest_lesson" ADD CONSTRAINT "ingest_lesson_ingest_id_fkey" FOREIGN KEY ("ingest_id") REFERENCES "ingest"."ingest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_lesson_captions" ADD CONSTRAINT "ingest_lesson_captions_ingest_id_fkey" FOREIGN KEY ("ingest_id") REFERENCES "ingest"."ingest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_lesson_captions" ADD CONSTRAINT "ingest_lesson_captions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "ingest"."ingest_lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_lesson_plan" ADD CONSTRAINT "ingest_lesson_plan_ingest_id_fkey" FOREIGN KEY ("ingest_id") REFERENCES "ingest"."ingest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_lesson_plan" ADD CONSTRAINT "ingest_lesson_plan_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "ingest"."ingest_lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_lesson_plan_part" ADD CONSTRAINT "ingest_lesson_plan_part_ingest_id_fkey" FOREIGN KEY ("ingest_id") REFERENCES "ingest"."ingest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_lesson_plan_part" ADD CONSTRAINT "ingest_lesson_plan_part_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "ingest"."ingest_lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_lesson_plan_part" ADD CONSTRAINT "ingest_lesson_plan_part_lesson_plan_id_fkey" FOREIGN KEY ("lesson_plan_id") REFERENCES "ingest"."ingest_lesson_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_openai_batch" ADD CONSTRAINT "ingest_openai_batch_ingest_id_fkey" FOREIGN KEY ("ingest_id") REFERENCES "ingest"."ingest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_error" ADD CONSTRAINT "ingest_error_ingest_id_fkey" FOREIGN KEY ("ingest_id") REFERENCES "ingest"."ingest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingest"."ingest_error" ADD CONSTRAINT "ingest_error_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "ingest"."ingest_lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
