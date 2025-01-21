import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Moderation } from "@prisma/client";

export const handleInitialiseModerations = (
  mods: Moderation[] | undefined,
  set: (state: {
    moderations: Moderation[];
    toxicInitialModeration: PersistedModerationBase | null;
    lastModeration: PersistedModerationBase | null;
  }) => void,
  get: () => {
    flagToxicModeration: (mod: PersistedModerationBase | null) => void;
  },
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
    get().flagToxicModeration(toxicMod);
  }
};
