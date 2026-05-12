-- CreateTable
CREATE TABLE "public"."threat_detections" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "app_session_id" TEXT NOT NULL,
    "message_id" TEXT,
    "user_id" TEXT NOT NULL,
    "threatening_message" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "category" TEXT,
    "severity" TEXT,
    "provider_response" JSONB,
    "is_false_positive" BOOLEAN NOT NULL DEFAULT false,
    "safety_violation_id" TEXT,

    CONSTRAINT "threat_detections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threat_detections_safety_violation_id_key" ON "public"."threat_detections"("safety_violation_id");

-- CreateIndex
CREATE INDEX "idx_threat_detections_app_session_id" ON "public"."threat_detections"("app_session_id");

-- CreateIndex
CREATE INDEX "idx_threat_detections_user_id" ON "public"."threat_detections"("user_id");

-- AddForeignKey
ALTER TABLE "public"."threat_detections" ADD CONSTRAINT "threat_detections_app_session_id_fkey" FOREIGN KEY ("app_session_id") REFERENCES "public"."app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."threat_detections" ADD CONSTRAINT "threat_detections_safety_violation_id_fkey" FOREIGN KEY ("safety_violation_id") REFERENCES "public"."policy_violations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
