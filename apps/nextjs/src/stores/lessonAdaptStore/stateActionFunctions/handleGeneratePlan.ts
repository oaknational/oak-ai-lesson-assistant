import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type { LessonAdaptGetter, LessonAdaptSetter } from "../types";

const log = aiLogger("adaptations");

export const handleGeneratePlan = (
  set: LessonAdaptSetter,
  get: LessonAdaptGetter,
  trpcUtils: TrpcUtils,
) => {
  return async (userMessage: string) => {
    const { sessionId } = get();

    if (!sessionId) {
      log.warn("Cannot generate plan: no sessionId available");
      return;
    }

    if (!userMessage.trim()) {
      log.warn("Cannot generate plan: empty user message");
      return;
    }

    set({ status: "generating-plan", error: null, currentPlan: null });

    try {
      const result = await trpcUtils.client.lessonAdapt.generatePlan.mutate({
        sessionId,
        userMessage,
      });

      // Extract all change IDs from the plan for initial approval state
      const allChangeIds = extractAllChangeIds(result.plan);

      set({
        currentPlan: result.plan,
        approvedChangeIds: allChangeIds, // All changes approved by default
        status: "ready",
      });

      log.info("Adaptation plan generated", {
        sessionId,
        totalChanges: result.plan.totalChanges,
        intent: result.plan.intent,
      });
    } catch (error) {
      log.error("Error generating plan", { sessionId, error });
      Sentry.captureException(error);
      set({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };
};

/**
 * Extract all change IDs from an adaptation plan
 */
function extractAllChangeIds(plan: {
  slidesAgentResponse: {
    changes: {
      textEdits: Array<{ changeId: string }>;
      tableCellEdits: Array<{ changeId: string }>;
      textElementDeletions: Array<{ changeId: string }>;
      slideDeletions: Array<{ changeId: string }>;
    };
  };
}): string[] {
  const { changes } = plan.slidesAgentResponse;
  return [
    ...changes.textEdits.map((c) => c.changeId),
    ...changes.tableCellEdits.map((c) => c.changeId),
    ...changes.textElementDeletions.map((c) => c.changeId),
    ...changes.slideDeletions.map((c) => c.changeId),
  ];
}
