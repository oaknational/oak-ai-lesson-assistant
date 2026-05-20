import { aiLogger } from "@oakai/logger";

import { type Draft, enablePatches, produceWithPatches } from "immer";

import type { LatestQuiz, PartialLessonPlan } from "../../../protocol/schema";
import {
  CompletedLessonPlanSchema,
  LatestQuizSchema,
} from "../../../protocol/schema";
import { sectionStepToAgentId } from "../agents/sectionAgents/sectionStepToAgentId";
import { immerPatchToJsonPatch } from "../compatibility/helpers/immerPatchToJsonPatch";
import { quizOperationDispatcher } from "../quizOperations/quizOperationDispatcher";
import {
  type PlanStep,
  type StructuralQuizIntent,
  structuralQuizIntentSchema,
} from "../schema";
import type {
  AgentResult,
  AilaExecutionContext,
  AilaTurnPhaseOutcome,
} from "../types";
import {
  shouldForceSectionFailure,
  shouldForceSectionThrow,
} from "../utils/faultInjection";
import { terminateWithFailure } from "./termination";

const log = aiLogger("aila:agents");

enablePatches();

/**
 * Execute each step in the plan sequentially using immer to track changes.
 * @returns `continue` if step execution finished, otherwise a terminal turn outcome
 */
export async function executePlanSteps(
  context: AilaExecutionContext,
): Promise<AilaTurnPhaseOutcome> {
  const plannerDecision = context.currentTurn.plannerOutput;
  if (!plannerDecision || plannerDecision.decision !== "plan") {
    return { status: "continue" };
  }

  for (const step of plannerDecision.plan) {
    context.currentTurn.currentStep = step;
    const stepOutcome = await executePlanStep(context, step);
    if (stepOutcome.status !== "continue") return stepOutcome;
  }

  return { status: "continue" };
}

async function executePlanStep(
  context: AilaExecutionContext,
  step: PlanStep,
): Promise<AilaTurnPhaseOutcome> {
  if (step.action === "delete") {
    executeDeleteStep(context, step);
    return { status: "continue" };
  }

  return await executeGenerateStep(context, step);
}

function executeDeleteStep(context: AilaExecutionContext, step: PlanStep) {
  commitStepUpdate(context, step, (draft) => {
    delete draft[step.sectionKey];
  });
}

async function executeGenerateStep(
  context: AilaExecutionContext,
  step: PlanStep,
): Promise<AilaTurnPhaseOutcome> {
  const { quizIntent } = step;
  if (
    quizIntent &&
    quizIntent.action !== "REGENERATE_QUIZ" &&
    (step.sectionKey === "starterQuiz" || step.sectionKey === "exitQuiz")
  ) {
    const parsedQuizIntent = structuralQuizIntentSchema.parse(quizIntent);

    return executeQuizDispatchStep(
      context,
      step,
      step.sectionKey,
      parsedQuizIntent,
    );
  }

  const result = await runSectionAgent(context, step);

  if (result.error) {
    log.error(
      `Section generation failed [${step.sectionKey}]: ${result.error.message}`,
    );
    return await terminateWithFailure(result.error, context, step.sectionKey);
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
  commitStepUpdate(context, step, (draft) => {
    (draft as Record<string, unknown>)[step.sectionKey] = validated;
  });

  return { status: "continue" };
}

async function executeQuizDispatchStep(
  context: AilaExecutionContext,
  step: PlanStep,
  sectionKey: "starterQuiz" | "exitQuiz",
  intent: StructuralQuizIntent,
): Promise<AilaTurnPhaseOutcome> {
  const currentQuiz: LatestQuiz = context.currentTurn.document[sectionKey] ?? {
    version: "v3",
    questions: [],
    imageMetadata: [],
  };

  const dispatchResult = await quizOperationDispatcher(
    currentQuiz,
    intent,
    async () => {
      const agentId = sectionStepToAgentId(step, {
        config: context.runtime.config,
        document: context.currentTurn.document,
      });
      const agent = context.runtime.sectionAgents[agentId];
      if (!agent) return null;
      const agentResult = await agent.handler(context);
      if (agentResult.error) return null;
      const quizResult = LatestQuizSchema.safeParse(agentResult.data);
      if (!quizResult.success) return null;
      return quizResult.data.questions[0] ?? null;
    },
  );

  if (dispatchResult.note) {
    context.currentTurn.notes.push({
      message: dispatchResult.note,
      sectionKey: step.sectionKey,
    });
  }

  commitStepUpdate(context, step, (draft) => {
    if (sectionKey === "starterQuiz") {
      draft.starterQuiz = dispatchResult.data;
    } else {
      draft.exitQuiz = dispatchResult.data;
    }
  });

  return { status: "continue" };
}

async function runSectionAgent(
  context: AilaExecutionContext,
  step: PlanStep,
): Promise<AgentResult<unknown>> {
  const agentId = sectionStepToAgentId(step, {
    config: context.runtime.config,
    document: context.currentTurn.document,
  });
  const agent = context.runtime.sectionAgents[agentId];
  if (!agent) {
    return { error: { message: `No agent registered for ${agentId}` } };
  }
  const forceSectionThrow = shouldForceSectionThrow(step.sectionKey);
  const forceSectionFailure = shouldForceSectionFailure(step.sectionKey);

  if (forceSectionThrow) {
    throw new Error(`Forced agentic section throw [${step.sectionKey}]`);
  }

  return forceSectionFailure
    ? {
        error: {
          message: `Forced agentic section failure [${step.sectionKey}]`,
        },
      }
    : await agent.handler(context);
}

function commitStepUpdate(
  context: AilaExecutionContext,
  step: PlanStep,
  updateDocument: (draft: Draft<PartialLessonPlan>) => void,
) {
  const [nextDoc, patches] = produceWithPatches(
    context.currentTurn.document,
    updateDocument,
  );

  context.currentTurn.document = nextDoc;
  context.callbacks.onSectionComplete(patches.map(immerPatchToJsonPatch));
  context.currentTurn.stepsExecuted.push(step);
}
