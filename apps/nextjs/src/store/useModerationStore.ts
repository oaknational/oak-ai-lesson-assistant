import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Moderation } from "@prisma/client";
import { create } from "zustand";

type ModerationStore = {
  toxicModeration: PersistedModerationBase | null;
  lastModeration: PersistedModerationBase | null;
  initialModerations: Moderation[];

  setToxicModeration: (mod: PersistedModerationBase | null) => void;
  setLastModeration: (mod: PersistedModerationBase | null) => void;
  setInitialModerations: (mods: Moderation[]) => void;
};

export const useModerationStore = create<ModerationStore>((set) => ({
  toxicModeration: null,
  lastModeration: null,
  initialModerations: [],

  setToxicModeration: (mod) => set({ toxicModeration: mod }),
  setLastModeration: (mod) => set({ lastModeration: mod }),
  setInitialModerations: (mods) => set({ initialModerations: mods }),
}));
