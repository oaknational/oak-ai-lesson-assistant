import {
  applyLessonPlanPatchImmutable,
  extractPatches,
  PatchDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";
import { createHash } from "crypto";

import type { AiMessage } from "@/stores/chatStore/types";

import type { LessonPlanStore } from "..";

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

export const handleMessagesUpdated =
  (
    set: (partial: Partial<LessonPlanStore>) => void,
    get: () => LessonPlanStore,
  ) =>
  (messages: AiMessage[], isLoading: boolean) => {
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
      applyMessageToLessonPlan(get, set, streamingMessage);
    }

    // ...,"sectionsToEdit":["a","b","c"],...
    const sectionsToEditStr = streamingMessage.content.match(
      /"sectionsToEdit":\[("([a-zA-Z0-9])+",?)*\]/,
    )?.[0];
    // '"sectionsToEdit":["a","b","c"]' => ["a", "b", "c"]
    const sectionsToEdit = sectionsToEditStr?.match(/([a-zA-Z0-9])+/g) ?? [];
    if (sectionsToEdit?.join(",") !== get().sectionsToEdit?.join(",")) {
      log.info(`sectionsToEdit changed to ${sectionsToEdit}`);
      set({ sectionsToEdit });
    }
  };

const applyMessageToLessonPlan = (get, set, message) => {
  log.info("Extracting patches from message", message);
  // NOTE: we don't need partial patches as weextract them with a regex
  const { validPatches } = extractPatches(message.content);
  log.info("valid patches", validPatches);

  validPatches.forEach((patch) => {
    const { appliedPatchHashes, lessonPlan } = get();
    const patchHash = generatePatchHash(patch);

    if (!appliedPatchHashes.has(patchHash)) {
      const updatedLessonPlan = timeOperation(() => {
        // NOTE: It's important that there isn't any cloning when applying the patch
        return applyLessonPlanPatchImmutable(lessonPlan ?? {}, patch);
      });
      if (updatedLessonPlan) {
        log.info("Applying patch", patch.value.path);
        set((state) => ({
          lessonPlan: updatedLessonPlan,
          // https://zustand.docs.pmnd.rs/guides/maps-and-sets-usage
          appliedPatchHashes: new Set(state.appliedPatchHashes).add(patchHash),
          appliedPatchPaths: [
            ...state.appliedPatchPaths,
            patch.value.path.replace("/", ""),
          ],
        }));
      } else {
        log.info("Patch failed to apply");
      }
    }
  });
};
