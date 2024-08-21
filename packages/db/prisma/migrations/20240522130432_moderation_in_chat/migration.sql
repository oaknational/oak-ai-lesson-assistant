-- CreateEnum
CREATE TYPE "ModerationSeverity" AS ENUM ('NONE', 'WARNING', 'FATAL');

-- AlterEnum
ALTER TYPE "LessonSnapshotTrigger" ADD VALUE 'MODERATION';

-- CreateTable
CREATE TABLE "moderations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "app_session_id" TEXT NOT NULL,
    "severity" "ModerationSeverity" NOT NULL,
    "reason" TEXT,
    "lesson_snapshot_id" TEXT,
    "user_comment" TEXT,
    "user_continued" BOOLEAN,

    CONSTRAINT "moderations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AilaUserFlag" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "flagged_by_user_id" TEXT NOT NULL,
    "app_session_id" TEXT NOT NULL,
    "lesson_snapshot_id" TEXT NOT NULL,
    "user_feedback" TEXT NOT NULL,

    CONSTRAINT "AilaUserFlag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "moderations" ADD CONSTRAINT "moderations_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderations" ADD CONSTRAINT "moderations_lesson_snapshot_id_fkey" FOREIGN KEY ("lesson_snapshot_id") REFERENCES "lesson_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AilaUserFlag" ADD CONSTRAINT "AilaUserFlag_flagged_by_user_id_fkey" FOREIGN KEY ("flagged_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AilaUserFlag" ADD CONSTRAINT "AilaUserFlag_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AilaUserFlag" ADD CONSTRAINT "AilaUserFlag_lesson_snapshot_id_fkey" FOREIGN KEY ("lesson_snapshot_id") REFERENCES "lesson_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
