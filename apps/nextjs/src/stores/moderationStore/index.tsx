import React from "react";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";
import type { Moderation } from "@prisma/client";
import { create, useStore, type StoreApi } from "zustand";

import { handleToxicModeration } from "./actionFunctions/handleToxicModeration";
import { handleUpdateModerationState } from "./actionFunctions/handleUpdateModerationState";

const log = aiLogger("moderation:store");

export type ModerationStore = {
  moderations: Moderation[] | [];
  toxicInitialModeration: PersistedModerationBase | null;
  toxicModeration: PersistedModerationBase | null;
  lastModeration: PersistedModerationBase | null;

  updateToxicModeration: (mod: PersistedModerationBase | null) => void;
  setLastModeration: (mod: PersistedModerationBase | null) => void;
  updateModerationState: (mods?: Moderation[]) => void;
};

export const createModerationStore = (props?: Partial<ModerationStore>) =>
  create<ModerationStore>((set, get) => ({
    moderations: [],
    toxicInitialModeration: null,
    toxicModeration: null,
    lastModeration: null,

    setLastModeration: (mod) => set({ lastModeration: mod }),

    updateToxicModeration: (mod) => {
      handleToxicModeration(mod, set);
    },
    updateModerationState: (mod) => {
      handleUpdateModerationState(mod, set, get);
    },
    ...props,
  }));

export interface ModerationStoreProviderProps {
  children: React.ReactNode;
}

export const ModerationStoreContext =
  React.createContext<StoreApi<ModerationStore> | null>(null);

export const ModerationStoreProvider: React.FC<
  ModerationStoreProviderProps
> = ({ children }) => {
  const [store] = React.useState(() => createModerationStore());

  return (
    <ModerationStoreContext.Provider value={store}>
      {children}
    </ModerationStoreContext.Provider>
  );
};

export const useModerationStore = <T,>(
  selector: (state: ModerationStore) => T,
): T => {
  const store = React.useContext(ModerationStoreContext);

  if (!store) {
    throw new Error(
      "ModerationsStoreProvider is missing in the component tree.",
    );
  }
  return useStore(store, selector);
};

useModerationStore.subscribe((state) => {
  log.info("Moderation store updated", state);
});
