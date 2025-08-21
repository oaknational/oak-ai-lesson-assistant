import { compare } from "fast-json-patch";

import type { JsonPatchDocumentOptional } from "../../../../protocol/jsonPatchProtocol";

export function buildPatches<T extends object>(
  prevValue: T,
  nextValue: T,
): JsonPatchDocumentOptional[] {
  // Generate patches from the document changes
  const patches: JsonPatchDocumentOptional[] = [];

  // Use fast-json-patch to detect changes
  const diff = compare(prevValue, nextValue);

  // Create proper patch objects for each change
  for (const patch of diff) {
    // Convert path from /subject to subject
    const sectionKey = patch.path.substring(1); // Remove leading slash

    if ("value" in patch) {
      if (patch.op === "test" || patch.op === "_get") {
        continue;
      }
      patches.push({
        type: "patch",
        reasoning: `Updated ${sectionKey} based on user request`,
        value: {
          op: patch.op,
          path: patch.path,
          value: patch.value,
        },
        status: "complete",
      });
    }
  }
  return patches;
}
