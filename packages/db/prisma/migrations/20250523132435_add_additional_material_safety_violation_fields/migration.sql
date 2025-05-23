-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."SafetyViolationAction" ADD VALUE 'PARTIAL_LESSON_GENERATION';
ALTER TYPE "public"."SafetyViolationAction" ADD VALUE 'ADDITIONAL_MATERIAL_GENERATION';

-- AlterEnum
ALTER TYPE "public"."SafetyViolationRecordType" ADD VALUE 'ADDITIONAL_MATERIAL_SESSION';
