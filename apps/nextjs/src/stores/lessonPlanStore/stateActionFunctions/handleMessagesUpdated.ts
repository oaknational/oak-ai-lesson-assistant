import {
  applyLessonPlanPatchImmutable,
  extractPatches,
  type PatchDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { LessonPlanKeySchema } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { createHash } from "crypto";

import type { AiMessage } from "@/stores/chatStore/types";

import type { LessonPlanGetter, LessonPlanSetter } from "../types";

const log = aiLogger("lessons:store");

const timeOperation = <T>(fn: () => T): T => {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  log.info(`applyLessonPlanPatch took ${endTime - startTime} milliseconds`);
  return result;
};

const generatePatchHash = (patch: PatchDocument): string => {
  const patchString = JSON.stringify(patch);
  const hash = createHash("sha256");
  hash.update(patchString);
  return hash.digest("hex");
};

const countCompleteParts = (messageStr: string) => {
  return [...messageStr.matchAll(/"status":"complete"/g)].length;
};

const extractSectionsToEdit = (messageStr: string) => {
  // ...,"sectionsToEdit":["a","b","c"],...
  const sectionsToEditStr = messageStr.match(
    /"sectionsToEdit":\[("([a-zA-Z0-9])+",?)*\]/,
  )?.[0];
  if (!sectionsToEditStr) {
    return [];
  }
  // '"sectionsToEdit":["a","b","c"]' => ["a", "b", "c"]
  return (
    sectionsToEditStr
      .replace('"sectionsToEdit":', "")
      .match(/([a-zA-Z0-9])+/g) ?? []
  );
};

export const handleMessagesUpdated = (
  set: LessonPlanSetter,
  get: LessonPlanGetter,
) => {
  const applyMessageToLessonPlan = (message: AiMessage) => {
    log.info("Extracting patches from message", message);
    // NOTE: we don't need partial patches as weextract them with a regex
    const { validPatches } = extractPatches(message.content);
    log.info("valid patches", validPatches);

    validPatches.forEach((patch) => {
      const { appliedPatchHashes, lessonPlan } = get();
      const patchHash = generatePatchHash(patch);

      if (!appliedPatchHashes.includes(patchHash)) {
        const updatedLessonPlan = timeOperation(() => {
          // NOTE: It's important that there isn't any cloning when applying the patch
          return applyLessonPlanPatchImmutable(lessonPlan ?? {}, patch);
        });
        if (updatedLessonPlan) {
          log.info("Applying patch", patch.value.path);
          const patchPath = LessonPlanKeySchema.parse(
            patch.value.path.replace("/", ""),
          );
          set((state) => ({
            lessonPlan: updatedLessonPlan,
            appliedPatchHashes: [...state.appliedPatchHashes, patchHash],
            appliedPatchPaths: [...state.appliedPatchPaths, patchPath],
          }));
        } else {
          log.info("Patch failed to apply");
        }
      }
    });
  };

  return (messages: AiMessage[]) => {
    if (!get().isAcceptingChanges) {
      log.info("message skipped: not accepting changes");
      return;
    }
    const streamingMessage = messages[messages.length - 1];
    if (!streamingMessage) {
      log.info("message skipped: no message");
      return;
    }
    if (streamingMessage.role !== "assistant") {
      log.info("message skipped: wrong role");
      return;
    }

    const numberOfStreamedCompleteParts = countCompleteParts(
      streamingMessage.content,
    );

    if (numberOfStreamedCompleteParts !== get().numberOfStreamedCompleteParts) {
      log.info(
        `numberOfCompleteParts changed to ${numberOfStreamedCompleteParts}`,
      );
      set({ numberOfStreamedCompleteParts });
      applyMessageToLessonPlan(streamingMessage);
    }

    const sectionsToEdit = extractSectionsToEdit(streamingMessage.content);
    if (sectionsToEdit.join(",") !== get().sectionsToEdit?.join(",")) {
      log.info(`sectionsToEdit changed to ${sectionsToEdit.join(",")}`);
      const parsedSectionsToEdit =
        LessonPlanKeySchema.array().parse(sectionsToEdit);
      set({ sectionsToEdit: parsedSectionsToEdit });
    }
  };
};
