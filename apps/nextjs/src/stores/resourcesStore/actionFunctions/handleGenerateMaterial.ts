import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialInput } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialResponse } from "@oakai/api/src/router/additionalMaterials/generateAdditionalMaterial";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export type GenerateMaterialParams = {
  message?: string;
  mutateAsync: UseMutateAsyncFunction<
    GenerateAdditionalMaterialResponse,
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

    const docTypeParsed = additionalMaterialTypeEnum.parse(docType);
    if (!docType) {
      log.error("No document type selected");
      throw new Error("No document type selected");
    }

    // Validate required lesson plan fields
    const lessonPlan = get().pageData.lessonPlan;
    if (!lessonPlan?.title || !lessonPlan?.subject || !lessonPlan?.keyStage) {
      log.error("Missing required lesson plan fields", { lessonPlan });
      throw new Error(
        "Lesson plan is missing required fields (title, subject, or keyStage)",
      );
    }

    try {
      log.info("Generating material", { docType, hasMessage: !!message });

      // Make the API call
      const result = await mutateAsync({
        documentType: docTypeParsed,
        action: message ? "refine" : "generate",
        context: {
          lessonPlan: {
            ...lessonPlan,
            title: lessonPlan.title,
            subject: lessonPlan.subject,
            keyStage: lessonPlan.keyStage,
          },
          message: message ?? null,
          previousOutput: null,
          options: null,
        },
        lessonId: get().pageData.lessonPlan.lessonId,
      });
      get().actions.setIsResourcesLoading(false);

      set({
        generation: result.resource,
        moderation: result.moderation,
        id: result.resourceId,
      });

      log.info("Material generated successfully");
      get().actions.setStepNumber(2);
    } catch (error) {
      log.error("Error generating material", error);
      Sentry.captureException(error);
      throw error;
    }
  };
