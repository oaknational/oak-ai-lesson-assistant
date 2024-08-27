-- CreateTable
CREATE TABLE "downloads" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lesson_slug" TEXT NOT NULL,
    "download" JSONB NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);


-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_lesson_slug_fkey" FOREIGN KEY ("lesson_slug") REFERENCES "lessons"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
