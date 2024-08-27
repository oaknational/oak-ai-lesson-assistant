/*
  Warnings:

  - You are about to drop the column `keyStageSlug` on the `snippets` table. All the data in the column will be lost.
  - You are about to drop the column `subjectSlug` on the `snippets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "snippets" DROP COLUMN "keyStageSlug",
DROP COLUMN "subjectSlug",
ADD COLUMN     "key_stage_id" TEXT,
ADD COLUMN     "key_stage_slug" TEXT,
ADD COLUMN     "subject_id" TEXT,
ADD COLUMN     "subject_slug" TEXT;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_key_stage_id_fkey" FOREIGN KEY ("key_stage_id") REFERENCES "key_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
