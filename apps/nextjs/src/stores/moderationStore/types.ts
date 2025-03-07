import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Moderation } from "@prisma/client";
import type { StoreApi } from "zustand";

import type { AilaStreamingStatus } from "../chatStore/types";

export type ModerationState = {
  id: string;
  moderations: Moderation[] | [];
  isModerationsLoading: boolean | null;
  toxicInitialModeration: PersistedModerationBase | null;
  toxicModeration: PersistedModerationBase | null;
  lastModeration: PersistedModerationBase | null;

  actions: {
    updateToxicModeration: (mod: PersistedModerationBase | null) => void;
    setLastModeration: (mod: PersistedModerationBase | null) => void;
    setIsModerationsLoading: (isModerationsLoading: boolean) => void;
    updateModerationState: (mods?: Moderation[]) => void;
    fetchModerations: () => Promise<void>;

    clearModerations: () => void;
    ailaStreamingStatusUpdated: (streamingStatus: AilaStreamingStatus) => void;
  };
};

export type ModerationGetter = StoreApi<ModerationState>["getState"];
export type ModerationSetter = StoreApi<ModerationState>["setState"];
