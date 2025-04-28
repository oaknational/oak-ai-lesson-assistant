import type { AdditionalMaterialSchemas } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialInput } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { z } from "zod";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export type GenerateMaterialParams = {
  message?: string;
  mutateAsync: UseMutateAsyncFunction<
    AdditionalMaterialSchemas,
    Error,
    GenerateAdditionalMaterialInput
  >;
};

export const handleGenerateMaterial =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  async ({ message, mutateAsync }: GenerateMaterialParams) => {
    // Clear any existing generation
    get().actions.setGeneration(null);
    get().actions.setIsResourcesLoading(true);
    const docType = get().docType;
    const docTypeEnum = z.enum([
      "additional-comprehension",
      "additional-glossary",
    ]);
    const docTypeParsed = docTypeEnum.parse(docType);
    if (!docType) {
      log.error("No document type selected");
      throw new Error("No document type selected");
    }

    try {
      log.info("Generating material", { docType, hasMessage: !!message });

      // Make the API call
      const result = await mutateAsync({
        documentType: docTypeParsed,
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
