import { aiLogger } from "@oakai/logger";
import {
  generateTeachingMaterialInputSchema,
  teachingMaterialTypeEnum,
} from "@oakai/teaching-materials/src/documents/teachingMaterials/configSchema";
import type { RefinementOption } from "@oakai/teaching-materials/src/documents/teachingMaterials/resourceTypes";

import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("teaching-materials");

export const handleRefineMaterial =
  (
    set: TeachingMaterialsSetter,
    get: TeachingMaterialsGetter,
    trpc: TrpcUtils,
  ) =>
  async (refinementOption: RefinementOption) => {
    const {
      actions: { setIsResourceRefining },
      docType,
      generation: currentGeneration,
      refinementGenerationHistory: currentHistory,
      id: originalId,
      pageData: { lessonPlan },
      source,
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

      const docTypeParsed = teachingMaterialTypeEnum.parse(docType);

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
        source,
      };

      const parsedPayload = generateTeachingMaterialInputSchema.parse(payload);

      // Make the API call
      const result =
        await trpc.client.teachingMaterials.generateTeachingMaterial.mutate(
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
