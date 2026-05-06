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
  terminateWithFailure,
  terminateWithResponse,
} from "./execution/termination";
import type {
  AilaExecutionContext,
  AilaTurnArgs,
  AilaTurnOutcome,
} from "./types";

export async function ailaTurn({
  persistedState,
  runtime,
  callbacks,
}: AilaTurnArgs): Promise<AilaTurnOutcome> {
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
      notes: [],
      stepsExecuted: [],
      relevantLessonsFetched: false,
      currentStep: null,
    },
    callbacks,
  };

  try {
    /**
     * 1. Decide what the turn should do next.
     */
    const planningOutcome = await executePlanningPhase(context);
    if (planningOutcome.status !== "continue") return planningOutcome;

    /**
     * 2. Apply any section changes.
     */
    const planOutcome = await executePlanSteps(context);
    if (planOutcome.status !== "continue") return planOutcome;

    /**
     * 3. Refresh relevant lessons if the document metadata changed.
     */
    const lessonsOutcome = await handleRelevantLessons(context);
    if (lessonsOutcome.status !== "continue") return lessonsOutcome;

    /**
     * 4. Send the final user-facing message for the turn.
     */
    return await terminateWithResponse(context);
  } catch (error) {
    const errorContext = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    };
    // Open the llmMessage wrapper before shared failure handling.
    if (!context.currentTurn.plannerOutput) {
      context.callbacks.onPlannerComplete({ sectionKeys: [] });
    }
    return await terminateWithFailure(errorContext, context);
  }
}
