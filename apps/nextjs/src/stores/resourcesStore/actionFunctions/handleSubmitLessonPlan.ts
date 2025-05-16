import type { PartialLessonContextSchemaType } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { GeneratePartialLessonPlanResponse } from "@oakai/api/src/router/additionalMaterials/generatePartialLessonPlan";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { TRPCError } from "@trpc/server";

import type {
  ErrorResponse,
  ErrorType,
  ResourcesGetter,
  ResourcesSetter,
} from "../types";

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
): PartialLessonContextSchemaType => {
  const validLessonFields = lessonFieldKeys.filter(
    (key) => key !== "title" && key !== "keyStage" && key !== "subject",
  );

  return {
    title: title ?? "",
    subject: subject ?? "",
    keyStage: keyStage ?? "",
    year: year ?? "",
    lessonParts: ["title", "keyStage", "subject", ...validLessonFields],
  };
};

/**
 * Determines the type of error that occurred during lesson plan generation
 */
const determineErrorType = (error: TRPCError): ErrorResponse => {
  let errorType: ErrorType = "unknown";
  let errorMessage = "An unexpected error occurred.";

  const { cause } = error;

  if (cause instanceof RateLimitExceededError) {
    errorType = "rate_limit";
    errorMessage = "You have been rate limited. Please try again later.";
  } else if (cause instanceof UserBannedError) {
    errorType = "banned";
    errorMessage = "Your account has been banned.";
  } else if (cause instanceof Error) {
    errorMessage = cause.message;
  } else if (typeof cause === "string") {
    errorMessage = cause;
  }

  return { type: errorType, message: errorMessage };
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
 * Main function to handle lesson plan submission
 */
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
    setIsLoadingLessonPlan(true);

    try {
      log.info("Processing lesson plan", { title, subject, keyStage, year });
      const apiInput = buildLessonPlanInput(title, subject, keyStage, year);
      const result = await mutateAsync(apiInput);
      updateStoreWithLessonPlan(set, result);
    } catch (error: unknown) {
      if (error instanceof TRPCError) {
        const errorDetails = determineErrorType(error);
        set({ error: errorDetails });
      }

      log.error("Error handling lesson plan", (error as Error)?.cause);
      Sentry.captureException(error);
    } finally {
      setIsLoadingLessonPlan(false);
    }
  };
