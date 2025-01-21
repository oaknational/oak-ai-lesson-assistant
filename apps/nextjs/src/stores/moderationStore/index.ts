import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";
import type { Moderation } from "@prisma/client";
import { create } from "zustand";

import { handleInitialiseModerations } from "./actionFunctions/handleInitialiseModerations";
import { handleToxicModeration } from "./actionFunctions/handleToxicModeration";

const log = aiLogger("moderation:store");

type ModerationStore = {
  moderations: Moderation[] | [];
  toxicInitialModeration: PersistedModerationBase | null;
  toxicModeration: PersistedModerationBase | null;
  lastModeration: PersistedModerationBase | null;

  flagToxicModeration: (mod: PersistedModerationBase | null) => void;
  setLastModeration: (mod: PersistedModerationBase | null) => void;
  initialiseModerations: (mods?: Moderation[]) => void;
};

export const useModerationStore = create<ModerationStore>((set, get) => ({
  moderations: [],
  toxicInitialModeration: null,
  toxicModeration: null,
  lastModeration: null,

  setLastModeration: (mod) => set({ lastModeration: mod }),

  flagToxicModeration: (mod) => {
    handleToxicModeration(mod, set);
  },
  initialiseModerations: (mod) => {
    handleInitialiseModerations(mod, set, get);
  },
}));

useModerationStore.subscribe((state) => {
  log.info("Moderation store updated", state);
});
