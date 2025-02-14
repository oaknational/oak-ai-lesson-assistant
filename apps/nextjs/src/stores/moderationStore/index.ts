import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Moderation } from "@prisma/client";
import { create } from "zustand";

import type { TrpcUtils } from "@/utils/trpc";

import type { ChatStore } from "../chatStore";
import { logStoreUpdates } from "../zustandHelpers";
import { handleFetchModerations } from "./actionFunctions/handleFetchModeration";
import { handleToxicModeration } from "./actionFunctions/handleToxicModeration";
import { handleUpdateModerationState } from "./actionFunctions/handleUpdateModerationState";

export type ModerationStore = {
  chatActions?: Pick<ChatStore, "setMessages">;

  id: string;
  moderations: Moderation[] | [];
  isModerationsLoading: boolean | null;
  toxicInitialModeration: PersistedModerationBase | null;
  toxicModeration: PersistedModerationBase | null;
  lastModeration: PersistedModerationBase | null;

  updateToxicModeration: (mod: PersistedModerationBase | null) => void;
  setLastModeration: (mod: PersistedModerationBase | null) => void;
  setIsModerationsLoading: (isModerationsLoading: boolean) => void;
  updateModerationState: (mods?: Moderation[]) => void;
  fetchModerations: () => Promise<void>;

  clearModerations: () => void;
};

export const createModerationStore = ({
  id,
  initialValues = {},
  trpcUtils,
}: {
  id: string;
  initialValues?: Partial<ModerationStore>;
  trpcUtils: TrpcUtils;
}) => {
  const moderationStore = create<ModerationStore>((set, get) => ({
    id,
    chatActions: undefined, // Passed in the provider
    moderations: [],
    isModerationsLoading: null,
    toxicInitialModeration: null,
    toxicModeration: null,
    lastModeration: null,

    setLastModeration: (mod) => set({ lastModeration: mod }),
    setIsModerationsLoading: (isModerationsLoading) =>
      set({ isModerationsLoading }),

    updateToxicModeration: (mod) => {
      handleToxicModeration(mod, set, get);
    },
    updateModerationState: (mod) => {
      handleUpdateModerationState(mod, set, get);
    },

    fetchModerations: handleFetchModerations(set, get, trpcUtils),

    clearModerations: () => {
      set({
        moderations: [],
        isModerationsLoading: null,
        toxicInitialModeration: null,
        toxicModeration: null,
        lastModeration: null,
      });
    },
    ...initialValues,
  }));
  logStoreUpdates(moderationStore, "moderation:store");
  return moderationStore;
};
