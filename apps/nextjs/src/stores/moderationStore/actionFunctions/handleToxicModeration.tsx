import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { GetStore } from "@/stores/AilaStoresProvider";

import type { ModerationSetter, ModerationGetter } from "../types";

export const handleToxicModeration =
  (
    getStore: GetStore,
    set: ModerationSetter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get: ModerationGetter,
  ) =>
  (mod: PersistedModerationBase | null) => {
    set({ toxicModeration: mod });
    getStore("chat").actions.setMessages([], false);
    getStore("lessonPlan").actions.resetStore();
  };
