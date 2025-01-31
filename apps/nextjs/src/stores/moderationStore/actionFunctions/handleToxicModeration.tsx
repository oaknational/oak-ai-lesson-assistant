import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { useChatStore } from "@/stores/AilaStoresProvider";

import type { ModerationStore } from "..";

export const handleToxicModeration = (
  mod: PersistedModerationBase | null,
  set: (state: Pick<ModerationStore, "toxicModeration">) => void,
) => {
  set({ toxicModeration: mod });

  //  @TODO setOverrideLessonPlan({});
};
