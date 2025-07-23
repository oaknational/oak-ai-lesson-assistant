import {
  additionalMaterialTypeEnum,
  generateAdditionalMaterialInputSchema,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialInput } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialResponse } from "@oakai/api/src/router/additionalMaterials/generateAdditionalMaterial";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

// Define type for refinement object
type RefinementOption = {
  type: string;
};

export type RefineMaterialParams = {
  refinement: RefinementOption[];
  mutateAsync: UseMutateAsyncFunction<
    GenerateAdditionalMaterialResponse,
    Error,
    GenerateAdditionalMaterialInput & { adaptsOutputId?: string | null }
  >;
};

export const handleRefineMaterial =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  async ({ refinement, mutateAsync }: RefineMaterialParams) => {
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
      log.info("Refining material", { docType, refinement });

      const docTypeParsed = additionalMaterialTypeEnum.parse(docType);

      const payload = {
        documentType: docTypeParsed,
        context: {
          lessonPlan,
          previousOutput: currentGeneration,
          options: null,
          refinement,
        },
        adaptsOutputId: originalId, // ID of the material being refined
        lessonId: lessonPlan.lessonId,
      };

      const parsedPayload =
        generateAdditionalMaterialInputSchema.parse(payload);

      // Make the API call
      const result = await mutateAsync(parsedPayload);

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
