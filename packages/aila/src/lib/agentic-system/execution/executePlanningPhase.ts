import type { AilaExecutionContext } from "../types";
import { terminateWithError, terminateWithResponse } from "./termination";

/**
 * Execute the planning phase using the planner agent
 * @returns false if the turn should end, true if it should continue
 */
export async function executePlanningPhase(
  context: AilaExecutionContext,
): Promise<boolean> {
  try {
    const plannerResponse = await context.runtime.plannerAgent({
      messages: context.persistedState.messages,
      document: context.persistedState.initialDocument,
      relevantLessons: context.persistedState.relevantLessons,
    });

    if (plannerResponse.error) {
      context.callbacks.onPlannerComplete({
        sectionKeys: [],
      });
      await terminateWithError(plannerResponse.error, context);
      return false;
    }

    context.currentTurn.plannerOutput = plannerResponse.data;

    if (context.currentTurn.plannerOutput.decision === "exit") {
      context.callbacks.onPlannerComplete({
        sectionKeys: [],
      });
      await terminateWithResponse(context);
      return false;
    }

    context.callbacks.onPlannerComplete({
      sectionKeys: context.currentTurn.plannerOutput.plan.map(
        (step) => step.sectionKey,
      ),
    });

    return true;
  } catch (error) {
    // handle unexpected errors
    context.callbacks.onPlannerComplete({
      sectionKeys: [],
    });
    throw error;
  }
}
