import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type { LessonAdaptGetter, LessonAdaptSetter } from "../types";

const log = aiLogger("adaptations");

export const handleFetchLessonContent = (
  set: LessonAdaptSetter,
  get: LessonAdaptGetter,
  trpcUtils: TrpcUtils,
) => {
  return async () => {
    const { lessonSlug } = get();

    if (!lessonSlug) {
      log.warn("Cannot fetch lesson content: no lessonSlug set");
      return;
    }

    set({ status: "loading-lesson", error: null });

    try {
      const result = await trpcUtils.lessonAdapt.getLessonContent.fetch({
        lessonSlug,
      });

      set({
        sessionId: result.sessionId,
        lessonData: result.lessonData,
        slideContent: result.slideContent,
        duplicatedPresentationId: result.duplicatedPresentationId,
        duplicatedPresentationUrl: result.duplicatedPresentationUrl,
        status: "ready",
      });

      log.info("Lesson content fetched successfully", {
        sessionId: result.sessionId,
        lessonSlug,
      });

      // Automatically fetch thumbnails after lesson content is ready
      void get().actions.fetchThumbnails();
    } catch (error) {
      log.error("Error fetching lesson content", { lessonSlug, error });
      Sentry.captureException(error);
      set({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };
};
