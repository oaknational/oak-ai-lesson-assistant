import type { AdditionalMaterialSchemas } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialInput } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { z } from "zod";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export type RefineMaterialParams = {
  refinement: string;
  mutateAsync: UseMutateAsyncFunction<
    AdditionalMaterialSchemas,
    Error,
    GenerateAdditionalMaterialInput
  >;
};

export const handleRefineMaterial =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  async ({ refinement, mutateAsync }: RefineMaterialParams) => {
    // Clear any existing generation
    get().actions.setGeneration(null);

    const docType = get().docType;
    if (!docType) {
      log.error("No document type selected");
      throw new Error("No document type selected");
    }

    try {
      log.info("Refining material", { docType, refinement });

      const docTypeEnum = z.enum([
        "additional-comprehension",
        "additional-glossary",
      ]);
      const docTypeParsed = docTypeEnum.parse(docType);

      const refinementEnum = z.enum([
        "custom",
        "lowerReadingAge",
        "increaseReadingAge",
      ]);
      const refinementParsed = refinementEnum.parse(refinement);

      // Make the API call
      const result = await mutateAsync({
        documentType: docTypeParsed,
        action: "refine",
        context: {
          lessonPlan: get().pageData.lessonPlan,
          previousOutput: get().generation,
          options: null,
          refinement: [{ type: refinementParsed }],
        },
      });

      // Update the store with the result
      get().actions.setGeneration(result);
      log.info("Material refined successfully");

      return result;
    } catch (error) {
      log.error("Error refining material", error);
      Sentry.captureException(error);
      throw error;
    }
  };
