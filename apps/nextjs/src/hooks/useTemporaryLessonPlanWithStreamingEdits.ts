import { useEffect, useState } from "react";

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
  isStreaming,
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
  const [tempLessonPlan, setTempLessonPlan] = useState<LooseLessonPlan>({
    ...lessonPlan,
  });
  const [appliedPatches, setAppliedPatches] = useState<PatchDocumentWithHash[]>(
    [],
  );

  useEffect(() => {
    if (!isStreaming && lessonPlan) {
      if (!equals(lessonPlan, tempLessonPlan)) {
        console.log("Reset the temp lesson plan to the lesson plan");
        setTempLessonPlan(deepClone(lessonPlan));
      }
    }
  }, [lessonPlan, isStreaming, tempLessonPlan]);

  function applyPatch(
    patch: PatchDocumentWithHash,
    workingLessonPlan: LooseLessonPlan,
  ) {
    console.log("Apply to temp", patch);
    const newLessonPlan: LooseLessonPlan | undefined = applyLessonPlanPatch(
      workingLessonPlan,
      patch,
    );
    if (newLessonPlan) {
      setTempLessonPlan(newLessonPlan);
    } else {
      return workingLessonPlan;
    }
    setAppliedPatches([...appliedPatches, patch]);
    return newLessonPlan;
  }

  function applyPatchWhileStillStreaming(
    patch: PatchDocument,
    workingLessonPlan: LooseLessonPlan,
  ) {
    const newLessonPlan: LooseLessonPlan | undefined = applyLessonPlanPatch(
      { ...workingLessonPlan },
      patch,
    );
    return newLessonPlan ?? workingLessonPlan;
  }

  if (!throttledAssistantMessages)
    return { tempLessonPlan, partialPatches: [], validPatches: [] };
  const lastMessage =
    throttledAssistantMessages[throttledAssistantMessages.length - 1];
  if (!lastMessage?.content)
    return { tempLessonPlan, partialPatches: [], validPatches: [] };

  const { validPatches, partialPatches } =
    extractPatchesFromMessage(lastMessage);

  let workingLessonPlan = { ...tempLessonPlan };

  for (const patch of validPatches) {
    // These documents are complete and should be applied once and update the temp lesson plan
    const { patch: patchToApply, hasBeenApplied } = patchHasBeenApplied(
      patch,
      appliedPatches,
      messageHashes,
    );

    if (!hasBeenApplied && patchToApply) {
      workingLessonPlan = applyPatch(patchToApply, { ...workingLessonPlan });
    }
  }

  const streamingPatch =
    partialPatches.length > 0
      ? partialPatches[partialPatches.length - 1]
      : undefined;

  if (streamingPatch) {
    // This document is incomplete so apply on each render but do not update the temp lesson plan
    workingLessonPlan = applyPatchWhileStillStreaming(streamingPatch, {
      ...workingLessonPlan,
    });
  }

  return {
    tempLessonPlan: workingLessonPlan,
    validPatches,
    partialPatches,
  };
};
