import { aiLogger } from "@oakai/logger";

import type { JsonPatchOperation } from "./helpers/immerPatchToJsonPatch";
import type { TextStreamer } from "./helpers/createTextStreamer";

const log = aiLogger("aila:agents");

/**
 * Wrap a raw JSON Patch operation in the protocol format.
 */
function wrapPatch(patch: JsonPatchOperation) {
  const sectionKey = patch.path.split("/")[1] ?? patch.path;
  return {
    type: "patch" as const,
    reasoning: `Updated ${sectionKey} based on user request`,
    value: patch,
    status: "complete",
  };
}

export const createOnSectionComplete =
  (textStreamer: TextStreamer, patchState: { isFirstSection: boolean }) =>
  (patches: JsonPatchOperation[]) => {
    let isFirstPatch = patchState.isFirstSection;

    for (const patch of patches) {
      if (isFirstPatch) {
        isFirstPatch = false;
      } else {
        textStreamer(",");
      }
      const wrapped = wrapPatch(patch);
      textStreamer(JSON.stringify(wrapped));
    }

    log.info("onSectionComplete:", patches);
    patchState.isFirstSection = false;
  };
