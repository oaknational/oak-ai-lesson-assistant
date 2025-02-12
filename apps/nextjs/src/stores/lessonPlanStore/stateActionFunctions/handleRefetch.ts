import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import invariant from "tiny-invariant";

import type { TrpcUtils } from "@/utils/trpc";

import type { LessonPlanGetter, LessonPlanSetter } from "../types";

const log = aiLogger("lessons:store");

export const handleRefetch = (
  set: LessonPlanSetter,
  get: LessonPlanGetter,
  trpc: TrpcUtils,
) => {
  return async () => {
    log.info("Refetching");
    try {
      const id = get().id;
      const result = await trpc.client.chat.appSessions.getChat.query({ id });
      invariant(result, "result should not be null");
      const { lessonPlan, iteration } = result;

      if (get().isAcceptingChanges) {
        log.info("Lesson plan from DB ignored while streaming");
        return;
      }
      const currentIteration = get().iteration;
      if (iteration && currentIteration && iteration <= currentIteration) {
        log.info(`Ignored lesson plan from DB with iteration #${iteration}`);
        return;
      }

      set({ lessonPlan, iteration });
      log.info(`Set lesson plan iteration #${iteration} from DB`);
    } catch (err) {
      log.error("Error refetching lessonPlanStore", err);
      Sentry.captureException(err);
    }
  };
};
