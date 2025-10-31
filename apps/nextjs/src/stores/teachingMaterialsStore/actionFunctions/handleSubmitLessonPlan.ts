import type { AdditionalMaterialType } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { PartialLessonContextSchemaType } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { PartialLessonPlanFieldKeyArraySchema } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { GeneratePartialLessonPlanResponse } from "@oakai/api/src/router/additionalMaterials/generatePartialLessonPlan";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import invariant from "tiny-invariant";

import type { TrpcUtils } from "@/utils/trpc";

import {
  type TeachingMaterialsGetter,
  type TeachingMaterialsSetter,
} from "../types";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("teaching-materials");

export type SubmitLessonPlanParams = {
  title: string;
  subject: string;
  year: string;
};

/**
 * Builds the API input for lesson plan generation
 */
const buildLessonPlanInput = (
  title: string,
  subject: string,
  year: string,
  docType: AdditionalMaterialType,
  source: "aila" | "owa",
): PartialLessonContextSchemaType => {
  const resourceType = getResourceType(docType);

  // Always include these base fields
  const baseFields = ["title", "keyStage", "subject"];

  // Get resource-specific lesson parts or use all fields as fallback
  let lessonPartsToGenerate = baseFields;

  if (resourceType?.lessonParts || resourceType?.owaLessonParts) {
    const lessonPartsFromResourceType =
      source === "owa"
        ? resourceType?.owaLessonParts
        : resourceType?.lessonParts;
    // Use resource-specific parts
    lessonPartsToGenerate = [...baseFields, ...lessonPartsFromResourceType];
    log.info("Building lesson plan from ", lessonPartsToGenerate);
  } else {
    // Fallback to all fields
    const validLessonFields = lessonFieldKeys.filter(
      (key) => !baseFields.includes(key),
    );
    lessonPartsToGenerate = [...baseFields, ...validLessonFields];
  }

  // Remove duplicates
  lessonPartsToGenerate = [...new Set(lessonPartsToGenerate)];

  const parsedLessonPartsToGenerate =
    PartialLessonPlanFieldKeyArraySchema.parse(lessonPartsToGenerate);

  return {
    title: title,
    subject: subject,
    year: year,
    lessonParts: parsedLessonPartsToGenerate,
  };
};

/**
 * Updates the store with successful lesson plan results
 */
const updateStoreWithLessonPlan = (
  set: TeachingMaterialsSetter,
  result: GeneratePartialLessonPlanResponse,
) => {
  if (isToxic(result.moderation)) {
    set({
      error: {
        type: "toxic",
        message: "Toxic content detected in lesson plan",
      },
      moderation: result.moderation,
      pageData: {
        lessonPlan: { lessonId: result.lessonId },
      },
    });
    return;
  }

  set({
    pageData: {
      lessonPlan: { ...result.lesson, lessonId: result.lessonId },
    },
    moderation: result.moderation,
    threatDetection: result.threatDetection,
    error: null,
  });

  log.info("Lesson plan updated successfully");
};

/**
 * Updates the material session with the lesson ID
 */
const updateMaterialSessionWithLessonId = async (
  resourceId: string | null,
  lessonId: string,
  trpc: TrpcUtils,
) => {
  invariant(resourceId, "Resource ID must be defined");

  try {
    await trpc.client.additionalMaterials.updateMaterialSession.mutate({
      resourceId,
      lessonId,
    });
    log.info("Material session updated with lesson ID", {
      resourceId,
      lessonId,
    });
  } catch (error) {
    log.error("Failed to update material session with lesson ID", error);
    Sentry.captureException(error);
  }
};

export const handleSubmitLessonPlan =
  (
    set: TeachingMaterialsSetter,
    get: TeachingMaterialsGetter,
    trpc: TrpcUtils,
  ) =>
  async ({ title, subject, year }: SubmitLessonPlanParams) => {
    const { setIsLoadingLessonPlan } = get().actions;
    const { docType, id: resourceId, source } = get();

    set({ stepNumber: 2 });
    setIsLoadingLessonPlan(true);

    invariant(resourceId, "Resource ID must be defined");
    invariant(docType, "DocType ID must be defined");
    try {
      log.info("Processing lesson plan", { title, subject, year });
      const apiInput = buildLessonPlanInput(
        title,
        subject,
        year,
        docType,
        source,
      );

      const result =
        await trpc.client.additionalMaterials.generatePartialLessonPlanObject.mutate(
          apiInput,
        );

      if (!result) {
        throw new Error("Failed to generate lesson plan");
      }

      updateStoreWithLessonPlan(set, result);

      // Update material session with lesson ID
      await updateMaterialSessionWithLessonId(
        resourceId,
        result.lessonId,
        trpc,
      );
      get().actions.analytics.trackMaterialRefined("lesson_summary_button");
    } catch (error: unknown) {
      handleStoreError(set, error, { context: "handleSubmitLessonPlan" });
      log.error("Error handling lesson plan", error);
    } finally {
      setIsLoadingLessonPlan(false);
    }
  };
