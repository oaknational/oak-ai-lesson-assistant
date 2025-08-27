import { aiLogger } from "@oakai/logger";

import { buildPatches } from "./helpers/buildPatches";
import { type TextStreamer } from "./helpers/createTextStreamer";

const log = aiLogger("aila:agents");

export const createOnSectionComplete =
  (textStreamer: TextStreamer, patchState: { isFirstSection: boolean }) =>
  <T extends object>(prevDoc: T, nextDoc: T) => {
    let isFirstPatch = patchState.isFirstSection;
    const patches = buildPatches(prevDoc, nextDoc);
    for (const patch of patches) {
      if (isFirstPatch) {
        isFirstPatch = false;
      } else {
        textStreamer(",");
      }
      const patchJson = JSON.stringify(patch);
      textStreamer(patchJson);
    }

    log.info("onSectionComplete: ", patches);
    // Mark that we've processed the first section
    patchState.isFirstSection = false;
  };
