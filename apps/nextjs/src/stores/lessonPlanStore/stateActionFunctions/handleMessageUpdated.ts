import {
  applyLessonPlanPatch,
  applyLessonPlanPatchImmutable,
  extractPatches,
  type PatchDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";
import type { Message as AiMessage } from "ai";
import { createHash } from "crypto";
import { deepClone } from "fast-json-patch";

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

export const handleMessageUpdated =
  (
    set: (partial: Partial<LessonPlanStore>) => void,
    get: () => LessonPlanStore,
  ) =>
  (message: AiMessage) => {
    log.info("onMessageUpdated");
    if (message.role !== "assistant") {
      return;
    }

    log.info("Extracting patches from message", message);
    const { validPatches } = extractPatches(message.content);

    validPatches.forEach((patch) => {
      const { appliedPatchHashes, lessonPlan } = get();
      const patchHash = generatePatchHash(patch);
      if (!appliedPatchHashes.has(patchHash)) {
        const updatedLessonPlan = timeOperation(() => {
          // NOTE: It's important that there isn't any cloning when applying the patch
          // TODO: Add a test for this
          // TODO: compare two immutable approaches
          return applyLessonPlanPatchImmutable(lessonPlan, patch);
          // return applyLessonPlanPatchImmutableProduce(lessonPlan, patch);
        });
        if (updatedLessonPlan) {
          log.info("Applied patch", patch.value.path);
          set({
            lessonPlan: updatedLessonPlan,
            appliedPatchHashes: new Set(appliedPatchHashes).add(patchHash),
          });
        }
      }
    });
  };
