import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type { LessonAdaptGetter, LessonAdaptSetter } from "../types";

const log = aiLogger("adaptations");

export const handleExecuteAdaptations = (
  set: LessonAdaptSetter,
  get: LessonAdaptGetter,
  trpcUtils: TrpcUtils,
) => {
  return async () => {
    const { sessionId, currentPlan, approvedChangeIds } = get();

    if (!sessionId) {
      log.warn("Cannot execute adaptations: no sessionId available");
      return;
    }

    if (!currentPlan) {
      log.warn("Cannot execute adaptations: no plan available");
      return;
    }

    if (approvedChangeIds.length === 0) {
      log.warn("Cannot execute adaptations: no changes approved");
      return;
    }

    set({ status: "executing", error: null });

    try {
      const result =
        await trpcUtils.client.lessonAdapt.executeAdaptations.mutate({
          sessionId,
          planData: currentPlan,
          approvedChangeIds,
        });

      if (result.success) {
        log.info("Adaptations executed successfully", {
          sessionId,
          executedChanges: result.executedChanges.length,
        });

        set({ previousPlanResponse: currentPlan });

        // Clear the plan and close the modal after successful execution
        set({
          currentPlan: null,
          approvedChangeIds: [],
          showReviewModal: false,
          status: "ready",
        });

        // Refresh thumbnails to show updated slides
        void get().actions.fetchThumbnails();
      } else {
        log.error("Adaptations execution had errors", {
          sessionId,
          errors: result.errors,
        });
        set({
          status: "error",
          error: new Error(result.errors?.join(", ") ?? "Execution failed"),
        });
      }
    } catch (error) {
      log.error("Error executing adaptations", { sessionId, error });
      Sentry.captureException(error);
      set({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };
};
