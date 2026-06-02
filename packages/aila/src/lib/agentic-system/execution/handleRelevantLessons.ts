import type { RagFetched } from "../../../protocol/schema";
import type { AilaExecutionContext, AilaTurnPhaseOutcome } from "../types";
import { hasSearchIdentityChangedSignificantly } from "./searchIdentity";
import { terminateWithResponse } from "./termination";

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

  if (basedOn) {
    // user has chosen a lesson to adapt — record that selection
    await persistRagFetched(context, {
      status: "selected",
      searchIdentity:
        title && subject && keyStage
          ? { title, subject, keyStage }
          : ragFetched.searchIdentity,
    });
    return { status: "continue" };
  }

  if (!title || !subject || !keyStage) {
    // can't form a search identity without all three — don't fetch
    return { status: "continue" };
  }

  const nextSearchIdentity = { title, subject, keyStage };
  if (
    !hasSearchIdentityChangedSignificantly(
      ragFetched.searchIdentity,
      nextSearchIdentity,
    )
  ) {
    return { status: "continue" };
  }

  const lessons = await context.runtime.fetchRelevantLessons({
    title,
    subject,
    keyStage,
  });
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
