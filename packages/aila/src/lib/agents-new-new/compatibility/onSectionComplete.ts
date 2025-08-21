import { buildPatches } from "./helpers/buildPatches";
import { type TextStreamer } from "./helpers/createTextStreamer";

export const createOnSectionComplete =
  (textStreamer: TextStreamer, isFirstPatch: boolean) =>
  <T extends object>(prevDoc: T, nextDoc: T) => {
    // Add comma if not the first patch
    if (!isFirstPatch) {
      textStreamer(",");
      isFirstPatch = true;
    }

    const patches = buildPatches(prevDoc, nextDoc);
    for (const patch of patches) {
      const patchJson = JSON.stringify(patch);
      textStreamer(patchJson);
    }
  };
