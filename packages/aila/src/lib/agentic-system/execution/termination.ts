import type { SectionKey } from "../schema";
import type { AilaExecutionContext, AilaTurnOutcome } from "../types";
import {
  shouldForceMessageToUserFailure,
  shouldForceMessageToUserThrow,
} from "../utils/faultInjection";
import {
  displayRelevantLessons,
  hardFailureMessage,
  messageToUserFallbackMessage,
} from "../utils/fixedResponses";

/**
 * Handle hard failures that occur during turn execution.
 */
export async function terminateWithFailure(
  error: { message: string },
  context: AilaExecutionContext,
  sectionKey?: SectionKey,
): Promise<AilaTurnOutcome> {
  if (context.currentTurn.stepsExecuted.length > 0) {
    context.currentTurn.errors.push({ ...error, sectionKey });
    return await terminateWithCustomMessage(
      messageToUserFallbackMessage(),
      context,
    );
  }

  context.currentTurn.errors.push({ ...error, sectionKey });
  await context.callbacks.onTurnFailed({
    stepsExecuted: context.currentTurn.stepsExecuted,
    ailaMessage: hardFailureMessage(),
  });
  return { status: "failed" };
}

/**
 * Generate a response message using the presentation agent
 */
export async function terminateWithResponse(
  context: AilaExecutionContext,
): Promise<AilaTurnOutcome> {
  if (context.currentTurn.relevantLessonsFetched) {
    const { relevantLessons } = context.currentTurn;
    const message = relevantLessons?.length
      ? displayRelevantLessons(relevantLessons.map((l) => l.lessonPlan))
      : "No relevant lessons found.";
    return await terminateWithCustomMessage(message, context);
  }

  if (shouldForceMessageToUserFailure()) {
    return await resolveMessageToUserError(
      { message: "Forced agentic message-to-user failure" },
      context,
    );
  }

  if (shouldForceMessageToUserThrow()) {
    throw new Error("Forced agentic message-to-user throw");
  }

  try {
    const messageResult = await context.runtime.messageToUserAgent({
      messages: context.persistedState.messages,
      prevDoc: context.persistedState.initialDocument,
      nextDoc: context.currentTurn.document,
      stepsExecuted: context.currentTurn.stepsExecuted,
      errors: context.currentTurn.errors,
      notes: context.currentTurn.notes,
      plannerOutput: context.currentTurn.plannerOutput,
      relevantLessons: context.persistedState.relevantLessons,
      relevantLessonsFetched: context.currentTurn.relevantLessonsFetched,
    });

    if (messageResult.error) {
      return await resolveMessageToUserError(messageResult.error, context);
    }

    return await terminateWithCustomMessage(
      messageResult.data.message,
      context,
    );
  } catch (error) {
    return await resolveMessageToUserError(
      {
        message: error instanceof Error ? error.message : "Unknown error",
      },
      context,
    );
  }
}

/**
 * Call onTurnComplete with given message
 */
export async function terminateWithCustomMessage(
  message: string,
  context: AilaExecutionContext,
): Promise<AilaTurnOutcome> {
  await context.callbacks.onTurnComplete({
    stepsExecuted: context.currentTurn.stepsExecuted,
    document: context.currentTurn.document,
    ailaMessage: message,
  });
  return { status: "success" };
}

async function resolveMessageToUserError(
  error: { message: string },
  context: AilaExecutionContext,
): Promise<AilaTurnOutcome> {
  if (context.currentTurn.stepsExecuted.length === 0) {
    return await terminateWithFailure(error, context);
  }

  context.currentTurn.errors.push(error);
  return await terminateWithCustomMessage(
    messageToUserFallbackMessage(),
    context,
  );
}
