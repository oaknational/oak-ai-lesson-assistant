import * as Sentry from "@sentry/node";
import { compare } from "fast-json-patch";
import { isTruthy } from "remeda";

import {
  type JsonPatchDocumentOptional,
  type PatchDocumentOptional,
  PatchDocumentOptionalSchema,
} from "../../../../protocol/jsonPatchProtocol";

export function buildPatches<T extends object>(
  prevValue: T,
  nextValue: T,
): JsonPatchDocumentOptional[] {
  const diff = compare(prevValue, nextValue);

  const patches: PatchDocumentOptional[] = diff
    .filter(
      (patch) =>
        patch.op !== "test" &&
        patch.op !== "_get" &&
        patch.op !== "move" &&
        patch.op !== "copy",
    )
    .map((patch) => {
      const document = {
        type: "patch" as const,
        reasoning: `Updated ${patch.path.substring(1)} based on user request`,
        value: patch,
        status: "complete",
      };

      const parseResult = PatchDocumentOptionalSchema.safeParse(document);

      if (!parseResult.success) {
        Sentry.captureException(
          new Error(
            `Failed to build patch document: ${JSON.stringify(
              parseResult.error,
            )}`,
          ),
        );
        return null;
      }

      return parseResult.data;
    })
    .filter(isTruthy);

  return patches;
}
