import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { PartialLessonContextSchemaType } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { PartialLessonPlanFieldKeyArraySchema } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { GeneratePartialLessonPlanResponse } from "@oakai/api/src/router/additionalMaterials/generatePartialLessonPlan";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import { aiLogger } from "@oakai/logger";

import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import { type ResourcesGetter, type ResourcesSetter } from "../types";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("additional-materials");

export type SubmitLessonPlanParams = {
  title: string;
  subject: string;
  keyStage: string;
  year: string;
  mutateAsync: UseMutateAsyncFunction<
    GeneratePartialLessonPlanResponse,
    Error,
    PartialLessonContextSchemaType
  >;
};

/**
 * Builds the API input for lesson plan generation
 */
const buildLessonPlanInput = (
  title: string,
  subject: string,
  keyStage: string,
  year: string,
  docType: string | null,
): PartialLessonContextSchemaType => {
  const resourceType = docType ? getResourceType(docType) : null;

  // Always include these base fields
  const baseFields = ["title", "keyStage", "subject"];

  // Get resource-specific lesson parts or use all fields as fallback
  let lessonPartsToGenerate = baseFields;

  if (resourceType?.lessonParts) {
    // Use resource-specific parts
    lessonPartsToGenerate = [...baseFields, ...resourceType.lessonParts];
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
    keyStage: keyStage,
    year: year,
    lessonParts: parsedLessonPartsToGenerate,
  };
};

/**
 * Updates the store with successful lesson plan results
 */
const updateStoreWithLessonPlan = (
  set: ResourcesSetter,
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

export const handleSubmitLessonPlan =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  async ({
    title,
    subject,
    keyStage,
    year,
    mutateAsync,
  }: SubmitLessonPlanParams) => {
    const { setStepNumber, setIsLoadingLessonPlan } = get().actions;
    const { docType } = get();

    // Change step first for immediate feedback - stay on current step during loading
    setIsLoadingLessonPlan(true);

    try {
      log.info("Processing lesson plan", { title, subject, keyStage, year });
      const apiInput = buildLessonPlanInput(
        title,
        subject,
        keyStage,
        year,
        docType,
      );
      const result = await mutateAsync(apiInput);

      updateStoreWithLessonPlan(set, result);
    } catch (error: unknown) {
      handleStoreError(set, error, { context: "handleSubmitLessonPlan" });
      log.error("Error handling lesson plan");
    } finally {
      setIsLoadingLessonPlan(false);
    }
  };
