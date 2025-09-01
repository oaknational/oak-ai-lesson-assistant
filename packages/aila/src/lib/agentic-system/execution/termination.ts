import type { AilaExecutionContext } from "../types";

/**
 * Handle errors that occur during the turn execution
 */
export async function terminateWithError(
  error: { message: string },
  context: AilaExecutionContext,
): Promise<void> {
  context.currentTurn.errors.push(error);
  await terminateWithResponse(context);
}

/**
 * Generate a response message using the presentation agent
 */
export async function terminateWithResponse(
  context: AilaExecutionContext,
): Promise<void> {
  const messageResult = await context.runtime.messageToUserAgent({
    messages: context.persistedState.messages,
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    stepsExecuted: context.currentTurn.stepsExecuted,
    errors: context.currentTurn.errors,
    plannerOutput: context.currentTurn.plannerOutput,
    relevantLessons: context.persistedState.relevantLessons,
    relevantLessonsFetched: context.currentTurn.relevantLessonsFetched,
  });

  if (messageResult.error) {
    await terminateWithGenericError(context);
    return;
  }

  await context.callbacks.onTurnComplete({
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    ailaMessage: messageResult.data.message,
  });
}

/**
 * Handle cases where the presentation agent itself fails
 */
export async function terminateWithGenericError(
  context: AilaExecutionContext,
): Promise<void> {
  const genericErrorMessage =
    "We encountered an error while processing your request.";

  await context.callbacks.onTurnComplete({
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    ailaMessage: genericErrorMessage,
  });
}
