import { useEffect, useRef, useMemo } from "react";

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
  const { validPatches, partialPatches } = extractPatches(message.content);
  console.log("Extracted valid patches", validPatches.length);
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
          console.log("ChatProvider: Deleting key", key);
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
    console.log("ChatProvider: applying patch", patch.value.path);
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

    return {
      tempLessonPlan: workingLessonPlan,
      validPatches,
      partialPatches,
    };
  }, [throttledAssistantMessages, messageHashes]);
};
