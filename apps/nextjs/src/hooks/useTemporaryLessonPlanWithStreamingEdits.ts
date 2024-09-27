import { useEffect, useRef, useMemo, useCallback } from "react";

import {
  PatchDocument,
  applyLessonPlanPatch,
  extractPatches,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { useThrottle } from "@uidotdev/usehooks";
import { type Message } from "ai/react";
import { deepClone } from "fast-json-patch";
import hash from "object-hash";
import { equals } from "remeda";

type PatchDocumentWithHash = PatchDocument & { hash: string };

const hashFor = (obj: object, messageHashes) => {
  const cached = messageHashes[JSON.stringify(obj)];
  if (cached) return cached;
  const h = hash(obj, { algorithm: "md5" });
  messageHashes[JSON.stringify(obj)] = h;
  return h;
};

function extractPatchesFromMessage(message: Message) {
  const { validPatches, partialPatches } = extractPatches(message.content, 100);
  return { validPatches, partialPatches };
}

function patchHasBeenApplied(
  patch: PatchDocument,
  appliedPatches: PatchDocumentWithHash[],
  messageHashes: Record<string, string>,
): { patch: PatchDocumentWithHash | null; hasBeenApplied: boolean } {
  const hash = hashFor(patch, messageHashes);
  const hasBeenApplied = appliedPatches.some(
    (appliedPatch) => hash === appliedPatch.hash,
  );
  return { hasBeenApplied, patch: { ...patch, hash } };
}

export const useTemporaryLessonPlanWithStreamingEdits = ({
  lessonPlan,
  messages,
  //isStreaming, // Disable partial patches for now
  messageHashes,
}: {
  lessonPlan?: LooseLessonPlan;
  messages?: Message[];
  isStreaming?: boolean;
  messageHashes: Record<string, string>;
}): {
  tempLessonPlan: LooseLessonPlan;
  validPatches: PatchDocument[];
  partialPatches: PatchDocument[];
} => {
  const throttledAssistantMessages = useThrottle(messages, 100);
  const tempLessonPlanRef = useRef<LooseLessonPlan>(lessonPlan ?? {});
  const appliedPatchesRef = useRef<PatchDocumentWithHash[]>([]);

  // Update the ref when lessonPlan changes
  useEffect(() => {
    if (lessonPlan && !equals(lessonPlan, tempLessonPlanRef.current)) {
      // Update existing keys and add new ones
      Object.keys(lessonPlan).forEach((key) => {
        tempLessonPlanRef.current[key] = deepClone(lessonPlan[key]);
      });
      // Remove keys that are no longer in lessonPlan
      Object.keys(tempLessonPlanRef.current).forEach((key) => {
        if (!(key in lessonPlan)) {
          delete tempLessonPlanRef.current[key];
        }
      });
      appliedPatchesRef.current = [];
    }
  }, [lessonPlan]);

  const applyPatch = (
    patch: PatchDocumentWithHash,
    workingLessonPlan: LooseLessonPlan,
  ) => {
    const newLessonPlan: LooseLessonPlan | undefined = applyLessonPlanPatch(
      workingLessonPlan,
      patch,
    );
    if (newLessonPlan) {
      Object.assign(tempLessonPlanRef.current, newLessonPlan);
      appliedPatchesRef.current.push(patch);
    }
    return newLessonPlan ?? workingLessonPlan;
  };

  // Disable partial patches for now
  // const applyPatchWhileStillStreaming = useCallback(
  //   (patch: PatchDocument, workingLessonPlan: LooseLessonPlan) => {
  //     if (!isStreaming) {
  //       return workingLessonPlan;
  //     }
  //     const newLessonPlan: LooseLessonPlan | undefined = applyLessonPlanPatch(
  //       { ...workingLessonPlan },
  //       patch,
  //     );
  //     return newLessonPlan ?? workingLessonPlan;
  //   },
  //   [isStreaming],
  // );

  return useMemo(() => {
    if (!throttledAssistantMessages || !throttledAssistantMessages.length) {
      return {
        tempLessonPlan: tempLessonPlanRef.current,
        partialPatches: [],
        validPatches: [],
      };
    }

    const lastMessage =
      throttledAssistantMessages[throttledAssistantMessages.length - 1];
    if (!lastMessage?.content) {
      return {
        tempLessonPlan: tempLessonPlanRef.current,
        partialPatches: [],
        validPatches: [],
      };
    }

    const { validPatches, partialPatches } =
      extractPatchesFromMessage(lastMessage);

    let workingLessonPlan = { ...tempLessonPlanRef.current };

    for (const patch of validPatches) {
      const { patch: patchToApply, hasBeenApplied } = patchHasBeenApplied(
        patch,
        appliedPatchesRef.current,
        messageHashes,
      );

      if (!hasBeenApplied && patchToApply) {
        workingLessonPlan = applyPatch(patchToApply, workingLessonPlan);
      }
    }

    // Do not apply partial patches for now
    // Keeping this commented out for now because we
    // will probably want to reintroduce this feature
    // const streamingPatch = partialPatches[partialPatches.length - 1];

    // if (streamingPatch) {
    //   workingLessonPlan = applyPatchWhileStillStreaming(
    //     streamingPatch,
    //     workingLessonPlan,
    //   );
    // }

    return {
      tempLessonPlan: workingLessonPlan,
      validPatches,
      partialPatches,
    };
  }, [throttledAssistantMessages, messageHashes]);
};
