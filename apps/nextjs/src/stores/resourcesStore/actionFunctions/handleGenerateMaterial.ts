import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialInput } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { GenerateAdditionalMaterialResponse } from "@oakai/api/src/router/additionalMaterials/generateAdditionalMaterial";
import { aiLogger } from "@oakai/logger";

import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import type { ResourcesGetter, ResourcesSetter } from "../types";
import { handleStoreError } from "../utils/errorHandling";

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
  async ({ mutateAsync }: GenerateMaterialParams) => {
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
    const formState = get().formState;
    if (
      !lessonPlan?.title ||
      !lessonPlan?.subject ||
      !lessonPlan?.keyStage ||
      !formState?.year
    ) {
      log.error("Missing required lesson plan fields", { lessonPlan });
      throw new Error(
        "Lesson plan is missing required fields (title, subject, or keyStage)",
      );
    }

    try {
      log.info("Generating material", { docType });

      // Make the API call
      const result = await mutateAsync({
        documentType: docTypeParsed,

        context: {
          lessonPlan: {
            ...lessonPlan,
            year: formState.year,
          },
          previousOutput: null,
          options: null,
        },
        resourceId: get().id, // Use existing resourceId
        lessonId: get().pageData.lessonPlan.lessonId,
        source: get().source,
      });
      get().actions.setIsResourcesLoading(false);

      set({
        generation: result.resource,
        moderation: result.moderation,
        refinementGenerationHistory: [],
      });

      log.info("Material generated successfully");
      get().actions.analytics.trackMaterialRefined(
        "create_teaching_material_button",
      );
    } catch (error) {
      get().actions.setIsResourcesLoading(false);
      handleStoreError(set, error, {
        context: "handleGenerateMaterial",
        documentType: docType,
      });
      log.error("Error generating material");
    }
  };
