/*
  Warnings:

  - You are about to drop the column `prompt` on the `generations` table. All the data in the column will be lost.
  - Added the required column `prompt_id` to the `generations` table without a default value. This is not possible if the table is not empty.
  - Made the column `app_id` on table `generations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "generations" DROP CONSTRAINT "generations_app_id_fkey";

-- AlterTable
ALTER TABLE "generations" DROP COLUMN "prompt",
ADD COLUMN     "prompt_id" TEXT NOT NULL,
ADD COLUMN     "prompt_inputs" JSONB,
ADD COLUMN     "prompt_text" TEXT,
ALTER COLUMN "app_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "template" TEXT NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prompts_slug_key" ON "prompts"("slug");

-- AddForeignKey
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
