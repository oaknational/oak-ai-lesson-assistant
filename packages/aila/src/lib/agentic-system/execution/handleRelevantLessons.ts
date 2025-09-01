import type { AilaExecutionContext } from "../types";
import { terminateWithResponse } from "./termination";

/**
 * Handle fetching relevant lessons if document metadata has changed
 * @returns false if the turn should end to show lessons, true if it should continue
 */
export async function handleRelevantLessons(
  context: AilaExecutionContext,
): Promise<boolean> {
  const { title, subject, keyStage, basedOn } = context.currentTurn.document;

  if (!title || !subject || !keyStage) {
    // if any of the above sections are missing, do not refetch RAG lessons
    return true;
  }

  if (basedOn) {
    // if the user has already chosen a lesson to adapt, do not refetch RAG lessons
    return true;
  }

  const hasDocumentMetadataChanged =
    title !== context.persistedState.initialDocument.title ||
    subject !== context.persistedState.initialDocument.subject ||
    keyStage !== context.persistedState.initialDocument.keyStage;

  if (!hasDocumentMetadataChanged) {
    // if above sections remain unchanged, do not refetch RAG lessons
    return true;
  }
  context.persistedState.relevantLessons =
    await context.runtime.fetchRelevantLessons();
  context.currentTurn.relevantLessonsFetched = true;

  if (context.persistedState.relevantLessons.length > 0) {
    await terminateWithResponse(context);
    return false;
  }

  return true;
}
