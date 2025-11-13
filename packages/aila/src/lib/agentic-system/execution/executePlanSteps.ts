import { sectionStepToAgentId } from "../agents/sectionAgents/sectionStepToAgentId";
import type { AilaExecutionContext } from "../types";
import { terminateWithError } from "./termination";

/**
 * Execute each step in the plan sequentially
 * @returns false if the turn should end due to error, true if successful
 */
export async function executePlanSteps(
  context: AilaExecutionContext,
): Promise<boolean> {
  const plannerDecision = context.currentTurn.plannerOutput;
  if (!plannerDecision || plannerDecision.decision !== "plan") {
    return true; // No plan to execute
  }

  for (const step of plannerDecision.plan) {
    const prevDoc = { ...context.currentTurn.document };
    context.currentTurn.stepsExecuted.push(step);

    if (step.action === "delete") {
      delete context.currentTurn.document[step.sectionKey];
      context.callbacks.onSectionComplete(
        prevDoc,
        context.currentTurn.document,
      );
      continue;
    }

    // Execute generation step
    const agentId = sectionStepToAgentId(step, {
      config: context.runtime.config,
      document: context.currentTurn.document,
    });
    const agent = context.runtime.sectionAgents[agentId];
    const result = await agent.handler(context);

    if (result.error) {
      await terminateWithError(result.error, context);
      return false;
    }

    context.currentTurn.document = {
      ...context.currentTurn.document,
      [step.sectionKey]: result.data,
    };

    context.callbacks.onSectionComplete(prevDoc, context.currentTurn.document);
  }

  return true;
}
