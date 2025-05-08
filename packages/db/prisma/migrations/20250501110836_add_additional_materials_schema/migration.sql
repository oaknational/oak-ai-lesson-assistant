-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "additional_materials";

-- CreateTable
CREATE TABLE "additional_materials"."AdditionalMaterialInteractions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "derived_from_id" TEXT,
    "adapts_output_id" TEXT,
    "config" JSONB NOT NULL,
    "input_text" TEXT,
    "input_threat_detection" JSONB,
    "output" JSONB,
    "output_moderation" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdditionalMaterialInteractions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "additional_materials"."AdditionalMaterialInteractions" ADD CONSTRAINT "AdditionalMaterialInteractions_derived_from_id_fkey" FOREIGN KEY ("derived_from_id") REFERENCES "additional_materials"."AdditionalMaterialInteractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_materials"."AdditionalMaterialInteractions" ADD CONSTRAINT "AdditionalMaterialInteractions_adapts_output_id_fkey" FOREIGN KEY ("adapts_output_id") REFERENCES "additional_materials"."AdditionalMaterialInteractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
