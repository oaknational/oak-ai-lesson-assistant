import type { AilaExecutionContext, AilaTurnPhaseOutcome } from "../types";
import {
  shouldForcePlannerFailure,
  shouldForcePlannerThrow,
} from "../utils/faultInjection";
import { terminateWithFailure, terminateWithResponse } from "./termination";

/**
 * Execute the planning phase using the planner agent
 * @returns `continue` to move to step execution, otherwise a terminal turn outcome
 */
export async function executePlanningPhase(
  context: AilaExecutionContext,
): Promise<AilaTurnPhaseOutcome> {
  if (shouldForcePlannerThrow()) {
    throw new Error("Forced agentic planner throw");
  }

  const plannerResponse = shouldForcePlannerFailure()
    ? { error: { message: "Forced agentic planner failure" } }
    : await context.runtime.plannerAgent({
        messages: context.persistedState.messages,
        document: context.persistedState.initialDocument,
        relevantLessons: context.persistedState.relevantLessons,
      });

  if (plannerResponse.error) {
    context.callbacks.onPlannerComplete({ sectionKeys: [] });
    return await terminateWithFailure(plannerResponse.error, context);
  }

  context.currentTurn.plannerOutput = plannerResponse.data;

  if (context.currentTurn.plannerOutput.decision === "exit") {
    context.callbacks.onPlannerComplete({ sectionKeys: [] });
    return await terminateWithResponse(context);
  }

  context.callbacks.onPlannerComplete({
    sectionKeys: context.currentTurn.plannerOutput.plan.map(
      (step) => step.sectionKey,
    ),
  });

  return { status: "continue" };
}
