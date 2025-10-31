import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("teaching-materials");

export const handleGenerateMaterial =
  (
    set: TeachingMaterialsSetter,
    get: TeachingMaterialsGetter,
    trpc: TrpcUtils,
  ) =>
  async () => {
    set({ stepNumber: 3 });

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
      const result =
        await trpc.client.additionalMaterials.generateAdditionalMaterial.mutate(
          {
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
          },
        );
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
      log.error("Error generating material", error);
      Sentry.captureException(error);
    }
  };
