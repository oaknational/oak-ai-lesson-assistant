import {
  additionalMaterialTypeEnum,
  generateAdditionalMaterialInputSchema,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { RefinementOption } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleRefineMaterial =
  (set: ResourcesSetter, get: ResourcesGetter, trpc: TrpcUtils) =>
  async (refinementOption: RefinementOption) => {
    const {
      actions: { setIsResourceRefining },
      docType,
      generation: currentGeneration,
      refinementGenerationHistory: currentHistory,
      id: originalId,
      pageData: { lessonPlan },
    } = get();

    log.info("Setting isResourceRefining to TRUE");
    setIsResourceRefining(true);

    if (!docType) {
      log.error("No document type selected");
      setIsResourceRefining(false);
      throw new Error("No document type selected");
    }

    try {
      log.info("Refining material", { docType, refinementOption });

      const docTypeParsed = additionalMaterialTypeEnum.parse(docType);

      const payload = {
        documentType: docTypeParsed,
        context: {
          lessonPlan,
          previousOutput: currentGeneration,
          options: null,
          refinement: [{ type: refinementOption.value }],
        },
        adaptsOutputId: originalId, // ID of the material being refined
        lessonId: lessonPlan.lessonId,
      };

      const parsedPayload =
        generateAdditionalMaterialInputSchema.parse(payload);

      // Make the API call
      const result =
        await trpc.client.additionalMaterials.generateAdditionalMaterial.mutate(
          parsedPayload,
        );

      // Add current generation to history before updating with new result
      // This ensures we can undo back to the current state
      const newHistory = currentGeneration
        ? [...currentHistory, currentGeneration]
        : currentHistory;

      // Update the store with the result and new history
      set({
        generation: result.resource,
        moderation: result.moderation,
        id: result.resourceId,
        refinementGenerationHistory: newHistory,
      });
      log.info("Material refined successfully", {
        historyLength: newHistory.length,
      });

      get().actions.analytics.trackMaterialRefined("modify_button");
    } catch (error) {
      log.error("Error refining material", error);
      Sentry.captureException(error);
      throw error;
    } finally {
      log.info("Setting isResourceRefining to FALSE");
      setIsResourceRefining(false);
    }
  };
