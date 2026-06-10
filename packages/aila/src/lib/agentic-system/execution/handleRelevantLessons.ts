import { enablePatches, produceWithPatches } from "immer";

import {
  CompletedLessonPlanSchema,
  type RagFetched,
} from "../../../protocol/schema";
import { immerPatchToJsonPatch } from "../compatibility/helpers/immerPatchToJsonPatch";
import type { AilaExecutionContext, AilaTurnPhaseOutcome } from "../types";
import { hasSearchIdentityChangedSignificantly } from "./searchIdentity";
import { terminateWithResponse } from "./termination";

enablePatches();

function searchIdentityEqual(
  a: RagFetched["searchIdentity"],
  b: RagFetched["searchIdentity"],
): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return (
    a.title === b.title && a.subject === b.subject && a.keyStage === b.keyStage
  );
}

async function persistRagFetched(
  context: AilaExecutionContext,
  next: RagFetched,
): Promise<void> {
  const prev = context.persistedState.ragFetched;
  if (
    prev.status === next.status &&
    searchIdentityEqual(prev.searchIdentity, next.searchIdentity)
  ) {
    return;
  }
  context.persistedState.ragFetched = next;
  await context.callbacks.onRagFetchedChange(next);
}

/** Decide whether to re-fetch RAG lessons; may terminate the turn early. */
export async function handleRelevantLessons(
  context: AilaExecutionContext,
): Promise<AilaTurnPhaseOutcome> {
  const { title, subject, keyStage, basedOn } = context.currentTurn.document;
  const ragFetched = context.persistedState.ragFetched;

  if (
    CompletedLessonPlanSchema.safeParse(context.currentTurn.document).success
  ) {
    return { status: "continue" };
  }

  const nextSearchIdentity =
    title && subject && keyStage ? { title, subject, keyStage } : null;

  if (basedOn) {
    // A basedOn that wasn't in the document at the start of the turn means the
    // user just chose a lesson to adapt, so it is valid even if the search
    // identity changed in the same turn.
    const basedOnSetThisTurn =
      basedOn !== context.persistedState.initialDocument.basedOn;

    const basedOnIsStale =
      !basedOnSetThisTurn &&
      ragFetched.searchIdentity != null &&
      nextSearchIdentity != null &&
      hasSearchIdentityChangedSignificantly(
        ragFetched.searchIdentity,
        nextSearchIdentity,
      );

    if (!basedOnIsStale) {
      // user has chosen a lesson to adapt and the search identity still
      // matches — record the selection and stop
      await persistRagFetched(context, {
        status: "selected",
        searchIdentity: nextSearchIdentity ?? ragFetched.searchIdentity,
      });
      return { status: "continue" };
    }

    // The lesson metadata changed significantly, so a basedOn carried over from
    // a previous lesson no longer applies and must be cleared before we refetch.
    clearBasedOn(context);
  }

  if (!nextSearchIdentity) {
    // can't form a search identity without all three — don't fetch
    return { status: "continue" };
  }

  if (
    !hasSearchIdentityChangedSignificantly(
      ragFetched.searchIdentity,
      nextSearchIdentity,
    )
  ) {
    return { status: "continue" };
  }

  const lessons =
    await context.runtime.fetchRelevantLessons(nextSearchIdentity);
  context.currentTurn.relevantLessons = lessons;
  context.currentTurn.relevantLessonsFetched = true;

  await persistRagFetched(context, {
    status: lessons.length > 0 ? "shown" : "none_found",
    searchIdentity: nextSearchIdentity,
  });

  if (lessons.length > 0) {
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
