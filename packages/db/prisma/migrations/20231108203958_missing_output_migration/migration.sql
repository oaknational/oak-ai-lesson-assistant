-- CreateTable
CREATE TABLE "shared_content" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "app_session_id" TEXT NOT NULL,

    CONSTRAINT "shared_content_pkey" PRIMARY KEY ("id")
);
