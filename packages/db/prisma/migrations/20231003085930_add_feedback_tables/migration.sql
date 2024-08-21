-- CreateTable
CREATE TABLE "user_tweaks" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "generation_id" TEXT NOT NULL,
    "tweaked_value" JSONB NOT NULL,

    CONSTRAINT "user_tweaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "re_generations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "previous_generation_id" TEXT NOT NULL,
    "replacement_generation_id" TEXT NOT NULL,

    CONSTRAINT "re_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_user_flags" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "generation_id" TEXT NOT NULL,
    "feedback_message" TEXT NOT NULL,
    "feedbackReasons" JSONB NOT NULL,

    CONSTRAINT "generation_user_flags_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_tweaks" ADD CONSTRAINT "user_tweaks_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "re_generations" ADD CONSTRAINT "re_generations_previous_generation_id_fkey" FOREIGN KEY ("previous_generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "re_generations" ADD CONSTRAINT "re_generations_replacement_generation_id_fkey" FOREIGN KEY ("replacement_generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_user_flags" ADD CONSTRAINT "generation_user_flags_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
