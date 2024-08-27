-- CreateEnum
CREATE TYPE "LessonExportType" AS ENUM ('STARTER_QUIZ_DOC', 'EXIT_QUIZ_DOC', 'LESSON_PLAN_DOC', 'LESSON_SLIDES_SLIDES', 'WORKSHEET_SLIDES');

-- CreateEnum
CREATE TYPE "LessonSnapshotTrigger" AS ENUM ('EXPORT_BY_USER');

-- CreateTable
CREATE TABLE "lesson_export_downloads" (
    "id" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "lesson_export_id" TEXT NOT NULL,
    "downloaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_export_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_exports" (
    "id" TEXT NOT NULL,
    "lesson_snapshot_id" TEXT NOT NULL,
    "export_type" "LessonExportType" NOT NULL,
    "template_gdrive_file_id" TEXT NOT NULL,
    "gdrive_file_id" TEXT NOT NULL,
    "gdrive_file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3),
    "user_can_view_gdrive_file" BOOLEAN NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "lesson_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_snapshots" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "lesson_json" JSONB NOT NULL,
    "lesson_schema_id" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "trigger" "LessonSnapshotTrigger" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "lesson_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_schemas" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "json_schema" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_user_grdive_file_id" ON "lesson_exports"("user_id", "gdrive_file_id");

-- CreateIndex
CREATE INDEX "idx_user_chat_hash" ON "lesson_snapshots"("user_id", "chat_id", "hash");

-- CreateIndex
CREATE INDEX "lesson_schemas_hash_idx" ON "lesson_schemas"("hash");

-- AddForeignKey
ALTER TABLE "lesson_export_downloads" ADD CONSTRAINT "lesson_export_downloads_lesson_export_id_fkey" FOREIGN KEY ("lesson_export_id") REFERENCES "lesson_exports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_exports" ADD CONSTRAINT "lesson_exports_lesson_snapshot_id_fkey" FOREIGN KEY ("lesson_snapshot_id") REFERENCES "lesson_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_snapshots" ADD CONSTRAINT "lesson_snapshots_lesson_schema_id_fkey" FOREIGN KEY ("lesson_schema_id") REFERENCES "lesson_schemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
