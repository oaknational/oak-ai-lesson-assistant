import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import invariant from "tiny-invariant";

import type { ModerationStore } from "..";

export const handleToxicModeration = (
  mod: PersistedModerationBase | null,
  set: (state: Pick<ModerationStore, "toxicModeration">) => void,
  get: () => ModerationStore,
) => {
  set({ toxicModeration: mod });
  const { chatActions, lessonPlanActions } = get();
  invariant(chatActions, "Passed into store in provider");
  invariant(lessonPlanActions, "Passed into store in provider");
  chatActions.setMessages([], false);
  lessonPlanActions.resetStore();
};
