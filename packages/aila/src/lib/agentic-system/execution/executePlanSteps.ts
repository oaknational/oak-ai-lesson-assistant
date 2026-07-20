import { aiLogger } from "@oakai/logger";

import { type Draft, enablePatches, produceWithPatches } from "immer";
import { type ZodType } from "zod";

import type {
  Keyword,
  LatestQuiz,
  Misconception,
  PartialLessonPlan,
} from "../../../protocol/schema";
import {
  CompletedLessonPlanSchema,
  KeyLearningPointsStrictMax4Schema,
  KeywordsSchema,
  LatestQuizMultipleChoiceOnlyStrictMax6Schema,
  LatestQuizSchema,
  MisconceptionsSchema,
} from "../../../protocol/schema";
import { sectionStepToAgentId } from "../agents/sectionAgents/sectionStepToAgentId";
import { immerPatchToJsonPatch } from "../compatibility/helpers/immerPatchToJsonPatch";
import { quizOperationDispatcher } from "../quizOperations/quizOperationDispatcher";
import { sectionListOperationDispatcher } from "../quizOperations/sectionListOperationDispatcher";
import { validateSingleQuestion } from "../quizOperations/validateSingleQuestion";
import {
  type PlanStep,
  type SectionKey,
  type StructuralItemIntent,
  structuralItemIntentSchema,
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
import { applyBritishEnglishCorrection } from "./applyBritishEnglishCorrection";
import { getCycleIndex, getCycleOutcomeForSection } from "./normalisePlanSteps";
import { terminateWithFailure } from "./termination";

const log = aiLogger("aila:agents");

enablePatches();

type ListSectionItem = Keyword | Misconception;

type ListSectionConfig<TItem> = {
  itemNoun: string;
  min: number;
  max: number;
  regenerateSuggestion: string;
  arraySchema: ZodType<TItem[]>;
  validateItem: (item: unknown) => boolean;
};

function hasNonEmptyStrings(item: unknown, keys: string[]): boolean {
  if (typeof item !== "object" || item === null) return false;
  const record = item as Record<string, unknown>;
  return keys.every((key) => {
    const value = record[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

/**
 * List-based sections that support targeted single-item edits. A section absent
 * from this map is handled by the normal whole-section agent path
 * (`runSectionAgent`), even if the planner emitted an itemIntent for it.
 *
 * `min`/`max` mirror the section schema's array bounds;
 * executePlanSteps.config.test.ts fails if they drift apart.
 */
export const LIST_SECTION_CONFIG: Partial<
  Record<
    SectionKey,
    ListSectionConfig<Keyword> | ListSectionConfig<Misconception>
  >
> = {
  keywords: {
    itemNoun: "keyword",
    min: 1,
    max: 5,
    regenerateSuggestion: "Generate the keywords again",
    arraySchema: KeywordsSchema,
    validateItem: (item) => hasNonEmptyStrings(item, ["keyword", "definition"]),
  },
  misconceptions: {
    itemNoun: "misconception",
    min: 1,
    max: 3,
    regenerateSuggestion: "Generate the misconceptions again",
    arraySchema: MisconceptionsSchema,
    validateItem: (item) =>
      hasNonEmptyStrings(item, ["misconception", "description"]),
  },
};

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
  const missingCycleOutcome = getMissingCycleOutcomeMessage(context, step);
  if (missingCycleOutcome) {
    return await terminateWithFailure(
      { message: missingCycleOutcome },
      context,
      step.sectionKey,
    );
  }

  const { itemIntent } = step;
  if (itemIntent && itemIntent.action !== "REGENERATE_SECTION") {
    const parsedItemIntent = structuralItemIntentSchema.parse(itemIntent);

    if (step.sectionKey === "starterQuiz" || step.sectionKey === "exitQuiz") {
      return executeQuizDispatchStep(
        context,
        step,
        step.sectionKey,
        parsedItemIntent,
      );
    }

    const listConfig = LIST_SECTION_CONFIG[step.sectionKey];
    if (listConfig) {
      return executeSectionListDispatchStep<ListSectionItem>(
        context,
        step,
        step.sectionKey,
        parsedItemIntent,
        listConfig,
      );
    }
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

  const corrected = await applyBritishEnglishCorrection({
    context,
    sectionKey: step.sectionKey,
    content: result.data,
    responseSchema: correctorResponseSchema(context, step),
  });

  const validated = corrected ?? sectionSchema.parse(result.data);

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

/**
 * The corrector validates its output against this schema. Strict for
 * default-agent quizzes and key learning points so it cannot re-introduce
 * extra options, questions or points; permissive for maths-bank quizzes and
 * every other section.
 */
function correctorResponseSchema(
  context: AilaExecutionContext,
  step: PlanStep,
) {
  const { sectionKey } = step;
  if (sectionKey === "starterQuiz" || sectionKey === "exitQuiz") {
    const agentId = sectionStepToAgentId(step, {
      config: context.runtime.config,
      document: context.currentTurn.document,
    });
    if (agentId === `${sectionKey}--default`) {
      return LatestQuizMultipleChoiceOnlyStrictMax6Schema;
    }
  }
  if (sectionKey === "keyLearningPoints") {
    return KeyLearningPointsStrictMax4Schema;
  }
  return CompletedLessonPlanSchema.shape[sectionKey];
}

function getMissingCycleOutcomeMessage(
  context: AilaExecutionContext,
  step: PlanStep,
): string | null {
  if (getCycleIndex(step.sectionKey) === null) return null;

  const targetOutcome = getCycleOutcomeForSection(
    context.currentTurn.document,
    step.sectionKey,
  );
  if (targetOutcome) return null;

  return `Cannot generate ${step.sectionKey}: matching learning cycle outcome is missing.`;
}

async function executeQuizDispatchStep(
  context: AilaExecutionContext,
  step: PlanStep,
  sectionKey: "starterQuiz" | "exitQuiz",
  intent: StructuralItemIntent,
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
      // Decline if more than one question comes back, rather than silently
      // using the first.
      const { questions } = quizResult.data;
      if (questions.length !== 1) return null;
      const question = questions[0];
      if (!validateSingleQuestion(question)) return null;
      // Correct only this new question, wrapped as a single-question quiz, so
      // existing questions are never sent to the corrector and stay untouched.
      // Strict schema for default agents, as in correctorResponseSchema.
      const correctedQuiz = await applyBritishEnglishCorrection({
        context,
        sectionKey,
        content: { ...currentQuiz, questions: [question] },
        responseSchema:
          agentId === `${sectionKey}--default`
            ? LatestQuizMultipleChoiceOnlyStrictMax6Schema
            : CompletedLessonPlanSchema.shape[sectionKey],
      });
      return correctedQuiz?.questions[0] ?? question ?? null;
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

async function executeSectionListDispatchStep<TItem>(
  context: AilaExecutionContext,
  step: PlanStep,
  sectionKey: SectionKey,
  intent: StructuralItemIntent,
  config: ListSectionConfig<TItem>,
): Promise<AilaTurnPhaseOutcome> {
  const existing = context.currentTurn.document[sectionKey];
  const sectionWasAbsent = existing == null;
  // TS can't correlate document[sectionKey] with the config picked by the same
  // key, so assert once here; arraySchema and validateItem do the real checks.
  const currentItems = (existing ?? []) as TItem[];

  const dispatchResult = await sectionListOperationDispatcher(
    currentItems,
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
      const parsed = config.arraySchema.safeParse(agentResult.data);
      if (!parsed.success) return null;
      // The add/change agents must return exactly one item; if more come back,
      // decline rather than silently using the first (which for a change could
      // land an unrelated item in the target slot).
      const data = parsed.data;
      if (data.length !== 1) return null;
      const item = data[0];
      if (!config.validateItem(item)) return null;
      // Correct only this new item, wrapped as a single-element section, so
      // existing items are never sent to the corrector and stay untouched.
      const correctedItems = await applyBritishEnglishCorrection({
        context,
        sectionKey,
        content: [item],
        responseSchema: config.arraySchema,
      });
      return correctedItems?.[0] ?? item ?? null;
    },
    {
      itemNoun: config.itemNoun,
      min: config.min,
      max: config.max,
      regenerateSuggestion: config.regenerateSuggestion,
    },
  );

  if (dispatchResult.note) {
    context.currentTurn.notes.push({
      message: dispatchResult.note,
      sectionKey,
    });
  }

  commitStepUpdate(context, step, (draft) => {
    // A declined edit on an absent section would write an empty array (e.g.
    // `keywords: []`), violating the section's min(1) schema; leave it absent.
    if (sectionWasAbsent && dispatchResult.data.length === 0) return;
    (draft as Record<string, unknown>)[sectionKey] = dispatchResult.data;
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
