/*
  Warnings:

  - The values [INAPPROPRIATE_CONTENT,INACCURATE_CONTENT] on the enum `AilaUserFlagType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `text_for_mod` to the `aila_user_modifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AilaUserFlagType_new" AS ENUM ('INAPPROPRIATE', 'INACCURATE', 'TOO_HARD', 'TOO_EASY', 'OTHER');
ALTER TABLE "chat_user_flags" ALTER COLUMN "flag_type" TYPE "AilaUserFlagType_new" USING ("flag_type"::text::"AilaUserFlagType_new");
ALTER TYPE "AilaUserFlagType" RENAME TO "AilaUserFlagType_old";
ALTER TYPE "AilaUserFlagType_new" RENAME TO "AilaUserFlagType";
DROP TYPE "AilaUserFlagType_old";
COMMIT;

-- AlterTable
ALTER TABLE "aila_user_modifications" ADD COLUMN     "text_for_mod" TEXT NOT NULL;
