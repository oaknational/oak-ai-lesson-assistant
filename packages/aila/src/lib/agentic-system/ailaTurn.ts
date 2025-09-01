import { executePlanSteps } from "./execution/executePlanSteps";
import { executePlanningPhase } from "./execution/executePlanningPhase";
import { handleRelevantLessons } from "./execution/handleRelevantLessons";
import {
  terminateWithGenericError,
  terminateWithResponse,
} from "./execution/termination";
import type { AilaExecutionContext, AilaTurnArgs } from "./types";

export async function ailaTurn({
  persistedState,
  runtime,
  callbacks,
}: AilaTurnArgs): Promise<void> {
  const context: AilaExecutionContext = {
    persistedState,
    runtime,
    currentTurn: {
      document: persistedState.initialDocument,
      plannerOutput: null,
      errors: [],
      stepsExecuted: [],
      relevantLessonsFetched: false,
    },
    callbacks,
  };

  try {
    /**
     * 1. Execute the planning phase
     */
    const shouldContinue = await executePlanningPhase(context);
    if (!shouldContinue) return;

    /**
     * 2. Execute the planned steps sequentially
     */
    const planExecuted = await executePlanSteps(context);
    if (!planExecuted) return;

    /**
     * 3. Handle relevant lessons fetching if needed
     */
    const lessonsHandled = await handleRelevantLessons(context);
    if (!lessonsHandled) return;

    /**
     * 4. Generate and deliver the final response
     */
    await terminateWithResponse(context);
  } catch (error) {
    const errorContext = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    };
    context.currentTurn.errors.push(errorContext);
    // Handle unexpected errors
    await terminateWithGenericError(context);
  }
}
