import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { GetStore } from "@/stores/AilaStoresProvider";

import type { ModerationStore } from "..";

export const handleToxicModeration =
  (
    getStore: GetStore,
    set: (state: Pick<ModerationStore, "toxicModeration">) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get: () => ModerationStore,
  ) =>
  (mod: PersistedModerationBase | null) => {
    set({ toxicModeration: mod });
    getStore("chat").setMessages([], false);
    getStore("lessonPlan").resetStore();
  };
