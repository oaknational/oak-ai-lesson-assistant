import { buildPatches } from "./helpers/buildPatches";
import { type TextStreamer } from "./helpers/createTextStreamer";

export const createOnSectionComplete =
  (textStreamer: TextStreamer, patchState: { isFirstSection: boolean }) =>
  <T extends object>(prevDoc: T, nextDoc: T) => {
    // Add comma if not the first patch
    if (!patchState.isFirstSection) {
      textStreamer(",");
      patchState.isFirstSection = true;
    }

    // let isFirstPatch = true;
    const patches = buildPatches(prevDoc, nextDoc);
    for (const patch of patches) {
      console.log(patchState);
      console.log(patch.type);
      const patchJson = JSON.stringify(patch);
      textStreamer(patchJson);
      // if (isFirstPatch) {
      //   isFirstPatch = false;
      // } else {
      //   textStreamer(",");
      // }
    }
  };
