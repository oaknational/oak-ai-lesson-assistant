import { buildPatches } from "./helpers/buildPatches";
import { type TextStreamer } from "./helpers/createTextStreamer";

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

    // Mark that we've processed the first section
    patchState.isFirstSection = false;
  };
