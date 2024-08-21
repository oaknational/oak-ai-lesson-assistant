-- AlterTable
ALTER TABLE "generations" ADD COLUMN     "prompt_inputs_hash" TEXT;

-- CreateIndex
CREATE INDEX "generations_prompt_inputs_hash_prompt_id_status_idx" ON "generations"("prompt_inputs_hash", "prompt_id", "status");
