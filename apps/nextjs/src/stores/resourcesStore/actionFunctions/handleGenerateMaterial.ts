import type { AdditionalMaterialSchemas } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export type GenerateMaterialParams = {
  message?: string;
  mutateAsync: UseMutateAsyncFunction<AdditionalMaterialSchemas, any, any>;
};

export const handleGenerateMaterial =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  async ({ message, mutateAsync }: GenerateMaterialParams) => {
    // Clear any existing generation
    get().actions.setGeneration(null);
    get().actions.setIsResourcesLoading(true);
    const docType = get().docType;
    if (!docType) {
      log.error("No document type selected");
      throw new Error("No document type selected");
    }

    try {
      log.info("Generating material", { docType, hasMessage: !!message });

      // Make the API call
      const result = await mutateAsync({
        documentType: docType,
        action: message ? "refine" : "generate",
        context: {
          lessonPlan: get().pageData.lessonPlan,
          message: message ?? null,
          previousOutput: null,
          options: null,
        },
      });
      get().actions.setIsResourcesLoading(false);
      // Update the store with the result
      get().actions.setGeneration(result);
      log.info("Material generated successfully");

      return result;
    } catch (error) {
      log.error("Error generating material", error);
      Sentry.captureException(error);
      throw error;
    }
  };
