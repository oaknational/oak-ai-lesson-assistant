import type { PartialLessonContextSchemaType } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
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
    LooseLessonPlan,
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

    // Change step first for immediate feedback
    setStepNumber(1);

    try {
      log.info("Processing lesson plan", { title, subject, keyStage, year });
      setIsLoadingLessonPlan(true);
      // @todo move this to the backend
      const validLessonFields = lessonFieldKeys.filter(
        (key) => get().pageData.lessonPlan[key],
      );

      // Prepare API input
      const apiInput: PartialLessonContextSchemaType = {
        title: title ?? "",
        subject: subject ?? "",
        keyStage: keyStage ?? "",
        year: year ?? "",
        lessonParts: ["title", "keyStage", "subject", ...validLessonFields],
      };

      // Make the API call
      const result = await mutateAsync(apiInput);
      setIsLoadingLessonPlan(false);
      // Update the store with the result
      set({ pageData: { lessonPlan: { ...result } } });
      log.info("Lesson plan updated successfully");

      return get().pageData.lessonPlan;
    } catch (error) {
      log.error("Error handling lesson plan", error);
      Sentry.captureException(error);
      throw error;
    }
  };
