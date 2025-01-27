import {
  applyLessonPlanPatchImmutable,
  extractPatches,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { PatchDocument } from "@oakai/aila/src/protocol/jsonPatchSchema";
import { aiLogger } from "@oakai/logger";
import type { Message as AiMessage } from "ai";
import { createHash } from "crypto";

import type { LessonPlanStore } from "..";

const log = aiLogger("lessons:store");

const generatePatchHash = (patch: PatchDocument): string => {
  const patchString = JSON.stringify(patch);
  const hash = createHash("sha256");
  hash.update(patchString);
  return hash.digest("hex");
};

const timeOperation = <T>(fn: () => T): T => {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  log.info(`applyLessonPlanPatch took ${endTime - startTime} milliseconds`);
  return result;
};

export const handleMessagesUpdated =
  (
    set: (partial: Partial<LessonPlanStore>) => void,
    get: () => LessonPlanStore,
  ) =>
  (messages: AiMessage[], isLoading: boolean) => {
    const message = messages[messages.length - 1];
    if (!message) {
      log.info("message skipped: no message");
      return;
    }
    if (message.role !== "assistant") {
      log.info("message skipped: wrong role");
      return;
    }

    // log.info("Extracting patches from message", message);
    const { validPatches, partialPatches } = extractPatches(message.content);
    log.info("valid patches", validPatches);
    log.info("partial patches", partialPatches);

    validPatches.forEach((patch) => {
      const { appliedPatchHashes, lessonPlan } = get();
      const patchHash = generatePatchHash(patch);
      // log.info(appliedPatchHashes);

      if (!appliedPatchHashes.has(patchHash)) {
        const updatedLessonPlan = timeOperation(() => {
          // NOTE: It's important that there isn't any cloning when applying the patch
          return applyLessonPlanPatchImmutable(lessonPlan ?? {}, patch);
        });
        if (updatedLessonPlan) {
          log.info("Applying patch", patch.value.path);
          set({
            lessonPlan: updatedLessonPlan,
            // https://zustand.docs.pmnd.rs/guides/maps-and-sets-usage
            appliedPatchHashes: new Set(appliedPatchHashes).add(patchHash),
          });
        } else {
          log.info("Patch failed to apply");
        }
      }
    });
  };
