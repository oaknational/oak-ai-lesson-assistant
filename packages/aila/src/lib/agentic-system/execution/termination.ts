import type { AilaExecutionContext } from "../types";
import {
  displayRelevantLessons,
  genericErrorMessage,
} from "../utils/fixedResponses";

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
  if (context.currentTurn.relevantLessonsFetched) {
    const { relevantLessons } = context.persistedState;
    if (!relevantLessons?.length) {
      await terminateWithCustomMessage("No relevant lessons found.", context);
      return;
    } else {
      const message = displayRelevantLessons(relevantLessons);
      await terminateWithCustomMessage(message, context);
      return;
    }
  }

  const messageResult = await context.runtime.messageToUserAgent({
    messages: context.persistedState.messages,
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    stepsExecuted: context.currentTurn.stepsExecuted,
    errors: context.currentTurn.errors,
    plannerOutput: context.currentTurn.plannerOutput,
    relevantLessons: context.persistedState.relevantLessons,
  });

  if (messageResult.error) {
    await terminateWithGenericError(context);
    return;
  }

  await terminateWithCustomMessage(messageResult.data.message, context);
}

/**
 * Handle cases where the presentation agent itself fails
 */
export async function terminateWithGenericError(
  context: AilaExecutionContext,
): Promise<void> {
  await terminateWithCustomMessage(genericErrorMessage(), context);
}

/**
 * Call onTurnComplete with given message
 */
export async function terminateWithCustomMessage(
  message: string,
  context: AilaExecutionContext,
): Promise<void> {
  await context.callbacks.onTurnComplete({
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    ailaMessage: message,
  });
}
