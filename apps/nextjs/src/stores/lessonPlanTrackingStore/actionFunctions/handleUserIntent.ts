import { aiLogger } from "@oakai/logger";

import type {
  LessonPlanTrackingGetter,
  LessonPlanTrackingSetter,
  MessageIntent,
} from "../types";

const log = aiLogger("analytics:lesson:store");

export const handleUserIntent = (
  set: LessonPlanTrackingSetter,
  get: LessonPlanTrackingGetter,
  message: MessageIntent,
) => {
  const willQueue = !!get().currentMessage;

  if (willQueue) {
    log.info("Queueing user intent");
    set({ queuedMessage: message });
  } else {
    log.info("Setting user intent");
    set({ currentMessage: message });
  }
};
