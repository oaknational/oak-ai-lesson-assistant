import { create } from "zustand";

import type { GetStore } from "@/stores/AilaStoresProvider";
import type { TrpcUtils } from "@/utils/trpc";

import { logStoreUpdates } from "../zustandHelpers";
import { handleAilaStreamingStatusUpdated } from "./actionFunctions/handleAilaStreamingStatus";
import { handleFetchModerations } from "./actionFunctions/handleFetchModeration";
import { handleLockingModeration } from "./actionFunctions/handleLockingModeration";
import { handleUpdateModerationState } from "./actionFunctions/handleUpdateModerationState";
import type { ModerationState } from "./types";

export * from "./types";

export const createModerationStore = ({
  id,
  initialValues = {},
  getStore,
  trpcUtils,
}: {
  id: string;
  initialValues?: Partial<ModerationState>;
  getStore: GetStore;
  trpcUtils: TrpcUtils;
}) => {
  const moderationStore = create<ModerationState>((set, get) => ({
    id,
    moderations: [],
    isModerationsLoading: null,
    lockingModeration: null,
    lastModeration: null,

    actions: {
      setLastModeration: (mod) => set({ lastModeration: mod }),
      setIsModerationsLoading: (isModerationsLoading) =>
        set({ isModerationsLoading }),

      updateLockingModeration: handleLockingModeration(getStore, set, get),
      updateModerationState: handleUpdateModerationState(set, get),

      fetchModerations: handleFetchModerations(set, get, trpcUtils),

      clearModerations: () => {
        set({
          moderations: [],
          isModerationsLoading: null,
          lockingModeration: null,
          lastModeration: null,
        });
      },
      ailaStreamingStatusUpdated: handleAilaStreamingStatusUpdated(set, get),
    },

    ...initialValues,
  }));
  logStoreUpdates(moderationStore, "moderation:store");
  return moderationStore;
};
