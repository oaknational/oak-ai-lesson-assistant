/*
  Warnings:

  - Made the column `feedback_value` on table `generation_user_flags` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "generation_user_flags" ADD COLUMN     "app_session_id" TEXT,
ALTER COLUMN "feedback_value" SET NOT NULL;

-- AlterTable
ALTER TABLE "generations" ADD COLUMN     "app_session_id" TEXT;

-- AlterTable
ALTER TABLE "re_generations" ADD COLUMN     "app_session_id" TEXT;

-- AlterTable
ALTER TABLE "user_tweaks" ADD COLUMN     "app_session_id" TEXT;

-- CreateTable
CREATE TABLE "app_sessions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "app_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "app_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tweaks" ADD CONSTRAINT "user_tweaks_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "re_generations" ADD CONSTRAINT "re_generations_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_user_flags" ADD CONSTRAINT "generation_user_flags_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "app_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
