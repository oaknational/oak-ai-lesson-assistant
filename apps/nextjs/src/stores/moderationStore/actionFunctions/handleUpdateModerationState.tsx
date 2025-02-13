import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { Moderation } from "@prisma/client";

import type { ModerationStore } from "..";

export const handleUpdateModerationState = (
  mods: Moderation[] | undefined,
  set: (state: Pick<ModerationStore, "moderations" | "lastModeration">) => void,
  get: () => ModerationStore,
) => {
  if (!mods || mods.length === 0) {
    return;
  }
  const lastMod = mods[mods.length - 1] ?? null;
  const toxicMod = mods.find((mod) => isToxic(mod));
  set({
    moderations: mods,
    lastModeration: lastMod,
  });

  if (toxicMod) {
    get().updateToxicModeration(lastMod);
  }
};
