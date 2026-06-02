import { enablePatches, produceWithPatches } from "immer";

import { immerPatchToJsonPatch } from "../compatibility/helpers/immerPatchToJsonPatch";
import type { AilaExecutionContext, AilaTurnPhaseOutcome } from "../types";
import { terminateWithResponse } from "./termination";

enablePatches();

/**
 * Handle fetching relevant lessons if document metadata has changed
 * @returns `continue` to keep going, otherwise a terminal turn outcome
 */
export async function handleRelevantLessons(
  context: AilaExecutionContext,
): Promise<AilaTurnPhaseOutcome> {
  const { title, subject, keyStage, basedOn } = context.currentTurn.document;
  const { initialDocument } = context.persistedState;

  if (!title || !subject || !keyStage) {
    // if any of the above sections are missing, do not refetch RAG lessons
    return { status: "continue" };
  }

  // A basedOn set during this turn means the user just chose a lesson to adapt,
  // so it is valid and we should not refetch.
  const basedOnSetThisTurn = basedOn !== initialDocument.basedOn;
  if (basedOn && basedOnSetThisTurn) {
    return { status: "continue" };
  }

  const hasDocumentMetadataChanged =
    title !== initialDocument.title ||
    subject !== initialDocument.subject ||
    keyStage !== initialDocument.keyStage;

  if (!hasDocumentMetadataChanged) {
    // metadata is unchanged, so any existing basedOn is still valid and there
    // is nothing new to fetch
    return { status: "continue" };
  }

  // The lesson metadata changed, so a basedOn carried over from a previous
  // lesson no longer applies and must be cleared before we refetch.
  if (basedOn) {
    clearBasedOn(context);
  }

  context.currentTurn.relevantLessons =
    await context.runtime.fetchRelevantLessons({ title, subject, keyStage });
  context.currentTurn.relevantLessonsFetched = true;

  if (context.currentTurn.relevantLessons.length > 0) {
    return await terminateWithResponse(context);
  }

  return { status: "continue" };
}

function clearBasedOn(context: AilaExecutionContext) {
  const [nextDoc, patches] = produceWithPatches(
    context.currentTurn.document,
    (draft) => {
      delete draft.basedOn;
    },
  );

  context.currentTurn.document = nextDoc;
  context.callbacks.onSectionComplete(patches.map(immerPatchToJsonPatch));
}
