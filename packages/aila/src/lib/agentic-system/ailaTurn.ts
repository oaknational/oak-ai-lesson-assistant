/**
 * #TODO: Add americanisms checking to agentic flow
 * The streaming flow passes detected americanisms to the LLM via AilaLessonPromptBuilder.
 * This isn't wired up here - section agents don't receive americanism warnings.
 * See: packages/aila/src/features/americanisms/AilaAmericanisms.ts
 */

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
      // Shallow copy prevents mutations to currentTurn.document from affecting
      // persistedState.initialDocument, ensuring onTurnComplete can diff them properly
      document: { ...persistedState.initialDocument },
      relevantLessons: persistedState.relevantLessons,
      plannerOutput: null,
      errors: [],
      stepsExecuted: [],
      relevantLessonsFetched: false,
      currentStep: null,
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
