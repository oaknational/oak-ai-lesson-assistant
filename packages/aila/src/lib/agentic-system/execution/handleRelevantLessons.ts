import type { AilaExecutionContext, AilaTurnPhaseOutcome } from "../types";
import { terminateWithResponse } from "./termination";

/**
 * Handle fetching relevant lessons if document metadata has changed
 * @returns `continue` to keep going, otherwise a terminal turn outcome
 */
export async function handleRelevantLessons(
  context: AilaExecutionContext,
): Promise<AilaTurnPhaseOutcome> {
  const { title, subject, keyStage, basedOn } = context.currentTurn.document;

  if (!title || !subject || !keyStage) {
    // if any of the above sections are missing, do not refetch RAG lessons
    return { status: "continue" };
  }

  if (basedOn) {
    // if the user has already chosen a lesson to adapt, do not refetch RAG lessons
    return { status: "continue" };
  }

  const hasDocumentMetadataChanged =
    title !== context.persistedState.initialDocument.title ||
    subject !== context.persistedState.initialDocument.subject ||
    keyStage !== context.persistedState.initialDocument.keyStage;

  if (!hasDocumentMetadataChanged) {
    // if above sections remain unchanged, do not refetch RAG lessons
    return { status: "continue" };
  }
  context.currentTurn.relevantLessons =
    await context.runtime.fetchRelevantLessons({ title, subject, keyStage });
  context.currentTurn.relevantLessonsFetched = true;

  if (context.currentTurn.relevantLessons.length > 0) {
    return await terminateWithResponse(context);
  }

  return { status: "continue" };
}
