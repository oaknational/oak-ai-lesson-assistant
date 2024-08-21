/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `prompts` will be added. If there are existing duplicate values, this will fail.
  - Made the column `hash` on table `prompts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "prompts" ALTER COLUMN "hash" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "prompts_hash_key" ON "prompts"("hash");
