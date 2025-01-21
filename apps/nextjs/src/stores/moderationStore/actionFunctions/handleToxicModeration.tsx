import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { useChatStore } from "src/stores/chatStore";

export const handleToxicModeration = (
  mod: PersistedModerationBase | null,
  set: (state: { toxicModeration: PersistedModerationBase | null }) => void,
) => {
  set({ toxicModeration: mod });
  useChatStore.getState().clearMessages();
};
