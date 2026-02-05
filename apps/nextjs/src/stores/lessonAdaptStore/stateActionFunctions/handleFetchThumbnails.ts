import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type { LessonAdaptGetter, LessonAdaptSetter } from "../types";

const log = aiLogger("adaptations");

export const handleFetchThumbnails = (
  set: LessonAdaptSetter,
  get: LessonAdaptGetter,
  trpcUtils: TrpcUtils,
) => {
  return async () => {
    const { duplicatedPresentationId } = get();

    if (!duplicatedPresentationId) {
      log.warn("Cannot fetch thumbnails: no presentationId available");
      return;
    }

    set({ thumbnailsLoading: true, thumbnailsError: null });

    try {
      const result = await trpcUtils.lessonAdapt.getSlideThumbnails.fetch({
        presentationId: duplicatedPresentationId,
      });

      set({
        thumbnails: result.thumbnails,
        thumbnailsLoading: false,
      });

      log.info("Thumbnails fetched successfully", {
        presentationId: duplicatedPresentationId,
        count: result.thumbnails.length,
      });
    } catch (error) {
      log.error("Error fetching thumbnails", {
        presentationId: duplicatedPresentationId,
        error,
      });
      Sentry.captureException(error);
      set({
        thumbnailsLoading: false,
        thumbnailsError:
          error instanceof Error ? error : new Error(String(error)),
      });
    }
  };
};
