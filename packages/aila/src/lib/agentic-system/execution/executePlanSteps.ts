import { aiLogger } from "@oakai/logger";

import { sectionStepToAgentId } from "../agents/sectionAgents/sectionStepToAgentId";
import type { AilaExecutionContext } from "../types";
import { terminateWithError } from "./termination";

const log = aiLogger("aila:agents");

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
    context.currentTurn.currentStep = step;
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
      log.error(
        `Section generation failed [${step.sectionKey}]: ${result.error.message}`,
      );
      await terminateWithError(result.error, context, step.sectionKey);
      return false;
    }

    if (result.note) {
      log.info(
        `Section generated with note [${step.sectionKey}]: ${result.note}`,
      );
      context.currentTurn.notes.push({
        message: result.note,
        sectionKey: step.sectionKey,
      });
    }

    context.currentTurn.document = {
      ...context.currentTurn.document,
      [step.sectionKey]: result.data,
    };

    context.callbacks.onSectionComplete(prevDoc, context.currentTurn.document);
  }

  return true;
}
