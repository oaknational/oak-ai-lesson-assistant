import {
  additionalMaterialTypeEnum,
  generateAdditionalMaterialInputSchema,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import type { GenerateAdditionalMaterialInput } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import {
  resourceTypesConfig,
  subjectSlugMap,
  yearSlugMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { GenerateAdditionalMaterialResponse } from "@oakai/api/src/router/additionalMaterials/generateAdditionalMaterial";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import invariant from "tiny-invariant";

import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import { getModerationTypes } from "@/lib/analytics/helpers";

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
  (set: ResourcesSetter, get: ResourcesGetter, track: TrackFns) =>
  async ({ refinement, mutateAsync }: RefineMaterialParams) => {
    const {
      actions: { setIsResourceRefining },
      docType,
      generation: currentGeneration,
      refinementGenerationHistory: currentHistory,
      id: originalId,
      pageData: { lessonPlan },
      formState,
      moderation,
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
        action: "refine",
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

      // Track the refinement event
      invariant(docType, "Document type is required for analytics");
      invariant(result.resourceId, "Resource ID is required for analytics");
      invariant(formState.subject, "Subject is required for analytics");
      invariant(formState.year, "Year is required for analytics");
      invariant(originalId, "Original ID is required for analytics");
      invariant(
        lessonPlan.title,
        "Lesson plan title is required for analytics",
      );

      track.teachingMaterialsRefined({
        teachingMaterialType: resourceTypesConfig[docType].analyticPropertyName,
        interactionId: originalId, // ID of the material being refined
        platform: "aila-beta",
        product: "ai lesson assistant",
        engagementIntent: "refine",
        componentType: "modify_button",
        eventVersion: "2.0.0",
        analyticsUseCase: "Teacher",
        subjectSlug: subjectSlugMap[formState.subject] ?? formState.subject,
        subjectTitle: formState.subject,
        yearGroupName: formState.year,
        yearGroupSlug: yearSlugMap[formState.year] ?? formState.year,
        lessonPlanTitle: lessonPlan.title,
        moderatedContentType: getModerationTypes(
          moderation
            ? { ...moderation, type: "moderation" as const }
            : undefined,
        ),
      });
    } catch (error) {
      log.error("Error refining material", error);
      Sentry.captureException(error);
      throw error;
    } finally {
      log.info("Setting isResourceRefining to FALSE");
      setIsResourceRefining(false);
    }
  };
