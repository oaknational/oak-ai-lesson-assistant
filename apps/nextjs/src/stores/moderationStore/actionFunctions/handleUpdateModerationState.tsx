import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { Moderation } from "@prisma/client";

import type { ModerationStore } from "..";

export const handleUpdateModerationState = (
  mods: Moderation[] | undefined,
  set: (
    state: Pick<
      ModerationStore,
      "moderations" | "toxicInitialModeration" | "lastModeration"
    >,
  ) => void,
  get: () => ModerationStore,
) => {
  if (!mods || mods.length === 0) {
    set({
      moderations: [],
      toxicInitialModeration: null,
      lastModeration: null,
    });
    return;
  }

  const toxicInitial = mods.find(isToxic) ?? null;
  const lastMod = mods[mods.length - 1] ?? null;
  const toxicMod = lastMod && isToxic(lastMod) ? lastMod : toxicInitial;

  set({
    moderations: mods,
    toxicInitialModeration: toxicInitial,
    lastModeration: lastMod,
  });

  if (toxicMod) {
    get().updateToxicModeration(toxicMod);
  }
};
