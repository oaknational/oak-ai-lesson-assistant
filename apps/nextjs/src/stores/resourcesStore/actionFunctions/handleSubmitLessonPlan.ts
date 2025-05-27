import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import {
  PartialLessonContextSchemaType,
  PartialLessonPlanFieldKeyArraySchema,
} from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { GeneratePartialLessonPlanResponse } from "@oakai/api/src/router/additionalMaterials/helpers";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

import type { ResourcesGetter, ResourcesSetter } from "../types";

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

    // Get the resource-specific lessonParts if available
    const resourceType = docType ? getResourceType(docType) : null;

    // Change step first for immediate feedback
    setStepNumber(1);

    try {
      log.info("Processing lesson plan", { title, subject, keyStage, year });
      setIsLoadingLessonPlan(true);

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
      const apiInput: PartialLessonContextSchemaType = {
        title: title ?? "",
        subject: subject ?? "",
        keyStage: keyStage ?? "",
        year: year ?? "",
        lessonParts: parsedLessonPartsToGenerate,
      };

      // Make the API call
      const result = await mutateAsync(apiInput);
      setIsLoadingLessonPlan(false);
      // Update the store with the result
      set({
        pageData: {
          lessonPlan: { ...result.lesson, lessonId: result.lessonId },
        },
        moderation: result.moderation,
        threatDetection: result.threatDetection,
      });
      log.info("Lesson plan updated successfully");
    } catch (error) {
      log.error("Error handling lesson plan", error);
      Sentry.captureException(error);
      throw error;
    }
  };
