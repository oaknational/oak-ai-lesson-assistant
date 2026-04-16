import type { Patch } from "immer";

/**
 * Raw JSON Patch operation (RFC 6902 subset).
 * We only support add/replace/remove - not move/copy/test.
 */
export type JsonPatchOperation =
  | { op: "add"; path: string; value: unknown }
  | { op: "replace"; path: string; value: unknown }
  | { op: "remove"; path: string };

/**
 * Convert immer patch (array path) to JSON Patch format (string path).
 *
 * Immer: { op: "replace", path: ["starterQuiz"], value: {...} }
 * JSON Patch: { op: "replace", path: "/starterQuiz", value: {...} }
 */
export function immerPatchToJsonPatch(patch: Patch): JsonPatchOperation {
  const path = "/" + patch.path.join("/");
  if (patch.op === "remove") {
    return { op: patch.op, path };
  }
  return { op: patch.op, path, value: patch.value };
}
