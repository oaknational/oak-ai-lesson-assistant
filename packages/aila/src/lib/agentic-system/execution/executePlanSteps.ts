import { aiLogger } from "@oakai/logger";
import { enablePatches, produceWithPatches } from "immer";

import { CompletedLessonPlanSchema } from "../../../protocol/schema";
import { sectionStepToAgentId } from "../agents/sectionAgents/sectionStepToAgentId";
import { immerPatchToJsonPatch } from "../compatibility/helpers/immerPatchToJsonPatch";
import type { AilaExecutionContext } from "../types";
import { terminateWithError } from "./termination";

const log = aiLogger("aila:agents");

enablePatches();

/**
 * Execute each step in the plan sequentially using immer to track changes.
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
    context.currentTurn.currentStep = step;
    context.currentTurn.stepsExecuted.push(step);

    if (step.action === "delete") {
      const [nextDoc, patches] = produceWithPatches(
        context.currentTurn.document,
        (draft) => {
          delete draft[step.sectionKey];
        },
      );
      context.currentTurn.document = nextDoc;
      context.callbacks.onSectionComplete(patches.map(immerPatchToJsonPatch));
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

    const sectionSchema = CompletedLessonPlanSchema.shape[step.sectionKey];
    const validated = sectionSchema.parse(result.data);

    // We use immer to generate JSON patches at the granularity we control.
    // Patches are generated at the exact path we mutate:
    // - `draft.starterQuiz = newQuiz` → patch at `/starterQuiz` (top-level)
    // - `draft.starterQuiz.questions[0] = q` → patch at `/starterQuiz/questions/0` (fine-grained)
    // Currently we do top-level assignments because the streaming schema only accepts
    // top-level patches. If we later want fine-grained updates, we change how we mutate.
    const [nextDoc, patches] = produceWithPatches(
      context.currentTurn.document,
      (draft) => {
        (draft as Record<string, unknown>)[step.sectionKey] = validated;
      },
    );

    context.currentTurn.document = nextDoc;
    context.callbacks.onSectionComplete(patches.map(immerPatchToJsonPatch));
  }

  return true;
}
