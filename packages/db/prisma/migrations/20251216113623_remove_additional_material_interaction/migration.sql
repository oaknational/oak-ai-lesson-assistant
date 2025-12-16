/*
  Warnings:

  - You are about to drop the `AdditionalMaterialInteractions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AdditionalMaterialInteractions" DROP CONSTRAINT "AdditionalMaterialInteractions_adapts_output_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."AdditionalMaterialInteractions" DROP CONSTRAINT "AdditionalMaterialInteractions_derived_from_id_fkey";

-- DropTable
DROP TABLE "public"."AdditionalMaterialInteractions";
