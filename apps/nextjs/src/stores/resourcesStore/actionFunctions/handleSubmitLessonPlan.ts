import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { PartialLessonContextSchemaType } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { PartialLessonPlanFieldKeyArraySchema } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { GeneratePartialLessonPlanResponse } from "@oakai/api/src/router/additionalMaterials/generatePartialLessonPlan";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import invariant from "tiny-invariant";

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
  updateSessionMutateAsync?: UseMutateAsyncFunction<
    { success: boolean },
    Error,
    { resourceId: string; lessonId: string }
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
  set({
    pageData: {
      lessonPlan: { ...result.lesson, lessonId: result.lessonId },
    },
    moderation: result.moderation,
    threatDetection: result.threatDetection,
    error: null, // clear previous errors
  });

  log.info("Lesson plan updated successfully");
};

/**
 * Updates the material session with the lesson ID
 */
const updateMaterialSessionWithLessonId = async (
  resourceId: string | null,
  lessonId: string,
  updateSessionMutateAsync?: UseMutateAsyncFunction<
    { success: boolean },
    Error,
    { resourceId: string; lessonId: string }
  >,
) => {
  invariant(resourceId, "Resource ID must be defined");
  invariant(
    updateSessionMutateAsync,
    "Update session mutate function must be defined",
  );

  try {
    await updateSessionMutateAsync({ resourceId, lessonId });
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
  (set: ResourcesSetter, get: ResourcesGetter) =>
  async ({
    title,
    subject,
    keyStage,
    year,
    mutateAsync,
    updateSessionMutateAsync,
  }: SubmitLessonPlanParams) => {
    const { setIsLoadingLessonPlan } = get().actions;
    const { docType, id: resourceId } = get();

    invariant(resourceId, "Resource ID must be defined");
    invariant(
      updateSessionMutateAsync,
      "Update session mutate function must be defined",
    );

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

      // Update material session with lesson ID
      await updateMaterialSessionWithLessonId(
        resourceId,
        result.lessonId,
        updateSessionMutateAsync,
      );
    } catch (error: unknown) {
      handleStoreError(set, error, { context: "handleSubmitLessonPlan" });
      log.error("Error handling lesson plan");
    } finally {
      setIsLoadingLessonPlan(false);
    }
  };
