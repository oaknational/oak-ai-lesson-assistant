-- AlterTable
ALTER TABLE "public"."threat_detections"
ADD COLUMN "record_type" "public"."SafetyViolationRecordType",
ADD COLUMN "record_id" TEXT,
ALTER COLUMN "app_session_id" DROP NOT NULL;

-- Backfill existing Aila threat detections
UPDATE "public"."threat_detections"
SET
  "record_type" = 'CHAT_SESSION',
  "record_id" = "app_session_id"
WHERE "record_type" IS NULL;

-- Finalise required columns after backfill
ALTER TABLE "public"."threat_detections"
ALTER COLUMN "record_type" SET NOT NULL,
ALTER COLUMN "record_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "idx_threat_detections_record"
ON "public"."threat_detections"("record_type", "record_id");
