-- AlterTable
ALTER TABLE "moderations" ADD COLUMN     "invalidated_at" TIMESTAMP(3),
ADD COLUMN     "invalidated_by" TEXT;
