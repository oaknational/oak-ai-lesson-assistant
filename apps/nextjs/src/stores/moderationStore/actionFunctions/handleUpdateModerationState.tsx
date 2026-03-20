import {
  isHighlySensitive,
  isToxic,
} from "@oakai/core/src/utils/ailaModeration/helpers";

import type { Moderation } from "@prisma/client";

import type { ModerationGetter, ModerationSetter } from "../types";

export const handleUpdateModerationState = (
  set: ModerationSetter,
  get: ModerationGetter,
) => {
  return (mods: Moderation[] | undefined) => {
    if (!mods || mods.length === 0) {
      return;
    }
    const lastMod = mods[mods.length - 1] ?? null;
    const lockingMod = mods.find(
      (mod) => isToxic(mod) || isHighlySensitive(mod),
    );
    set({
      moderations: mods,
      lastModeration: lastMod,
    });

    if (lockingMod) {
      get().actions.updateLockingModeration(lastMod);
    }
  };
};
