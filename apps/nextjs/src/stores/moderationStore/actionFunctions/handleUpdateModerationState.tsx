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

  // const toxicInitial = mods.find(isToxic) ?? null;
  const lastMod = mods[mods.length - 1] ?? null;
  console.log("moderation - check in handler");
  const toxicMod = lastMod ? isToxic(lastMod) : null;

  console.log("moderations", mods);
  console.log("lastMod moderation ", lastMod);
  console.log("moderation - toxicMod", toxicMod);
  // console.log("moderation  - toxicInitial", toxicInitial);

  set({
    moderations: mods,
    // toxicInitialModeration: toxicInitial, // this shouls be in the updateToxic mod section?
    lastModeration: lastMod,
  });

  if (toxicMod) {
    console.log("moderation - toxicMod", toxicMod);
    get().updateToxicModeration(lastMod);
  }
};
