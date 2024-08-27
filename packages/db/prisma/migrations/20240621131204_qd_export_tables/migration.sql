/*
  Warnings:

  - You are about to drop the column `user_continued` on the `moderations` table. All the data in the column will be lost.

*/


-- CreateTable
CREATE TABLE "qd_export_downloads" (
    "id" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "qd_export_id" TEXT NOT NULL,
    "downloaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qd_export_downloads_pkey" PRIMARY KEY ("id")
);



-- CreateTable
CREATE TABLE "qd_exports" (
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

    CONSTRAINT "qd_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qd_snapshots" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "qd_json" JSONB NOT NULL,
    "hash" TEXT NOT NULL,
    "trigger" "LessonSnapshotTrigger" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "qd_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_qd_user_grdive_file_id" ON "qd_exports"("user_id", "gdrive_file_id");

-- CreateIndex
CREATE INDEX "idx_qd_user_session_hash" ON "qd_snapshots"("user_id", "session_id", "hash");

-- AddForeignKey
ALTER TABLE "qd_export_downloads" ADD CONSTRAINT "qd_export_downloads_qd_export_id_fkey" FOREIGN KEY ("qd_export_id") REFERENCES "qd_exports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qd_exports" ADD CONSTRAINT "qd_exports_lesson_snapshot_id_fkey" FOREIGN KEY ("lesson_snapshot_id") REFERENCES "qd_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
