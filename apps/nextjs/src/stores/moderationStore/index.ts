import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";
import type { Moderation } from "@prisma/client";
import { create } from "zustand";

import { handleToxicModeration } from "./actionFunctions/handleToxicModeration";
import { handleUpdateModerationState } from "./actionFunctions/handleUpdateModerationState";

const log = aiLogger("moderation:store");

export type ModerationStore = {
  moderations: Moderation[] | [];
  isModerationsLoading: boolean | null;
  toxicInitialModeration: PersistedModerationBase | null;
  toxicModeration: PersistedModerationBase | null;
  lastModeration: PersistedModerationBase | null;

  updateToxicModeration: (mod: PersistedModerationBase | null) => void;
  setLastModeration: (mod: PersistedModerationBase | null) => void;
  setIsModerationsLoading: (isModerationLoading: boolean) => void;
  updateModerationState: (mods?: Moderation[]) => void;
  reset: (params: Partial<ModerationStore>) => void;
};

export const useModerationStore = create<ModerationStore>((set, get) => ({
  moderations: [],
  isModerationsLoading: null,
  toxicInitialModeration: null,
  toxicModeration: null,
  lastModeration: null,

  setLastModeration: (mod) => set({ lastModeration: mod }),
  setIsModerationsLoading: (isModerationsLoading) =>
    set({ isModerationsLoading }),

  updateToxicModeration: (mod) => {
    handleToxicModeration(mod, set);
  },
  updateModerationState: (mod) => {
    handleUpdateModerationState(mod, set, get);
  },
  // reset
  reset: (mod) => {
    set({
      moderations: mod.moderations ?? [],
      toxicInitialModeration: mod.toxicModeration ?? null,
      toxicModeration: mod.toxicModeration ?? null,
      lastModeration: mod.lastModeration ?? null,
    });
  },
}));

export type ModerationStoreState = ReturnType<
  typeof useModerationStore.getState
>;

useModerationStore.subscribe((state) => {
  log.info("Moderation store updated", state);
});
