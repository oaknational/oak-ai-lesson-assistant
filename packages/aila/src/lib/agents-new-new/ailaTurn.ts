import { sectionStepToAgentId } from "./sectionAgent/sectionStepToAgentId";
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
    await generateFinalResponse(context);
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

/**
 * Execute the planning phase using the planner agent
 * @returns false if the turn should end, true if it should continue
 */
async function executePlanningPhase(
  context: AilaExecutionContext,
): Promise<boolean> {
  const plannerResponse = await context.runtime.plannerAgent({
    messages: context.persistedState.messages,
    document: context.persistedState.initialDocument,
    relevantLessons: context.persistedState.relevantLessons,
  });

  if (plannerResponse.error) {
    await terminateWithError(plannerResponse.error, context);
    return false;
  }

  context.currentTurn.plannerOutput = plannerResponse.data;

  if (context.currentTurn.plannerOutput.decision === "exit") {
    await terminateWithResponse(context);
    return false;
  }

  context.callbacks.onPlannerComplete({
    sectionKeys: context.currentTurn.plannerOutput.plan.map(
      (step) => step.sectionKey,
    ),
  });

  return true;
}

/**
 * Execute each step in the plan sequentially
 * @returns false if the turn should end due to error, true if successful
 */
async function executePlanSteps(
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

/**
 * Handle fetching relevant lessons if document metadata has changed
 * @returns false if the turn should end to show lessons, true if it should continue
 */
async function handleRelevantLessons(
  context: AilaExecutionContext,
): Promise<boolean> {
  const { title, subject, keyStage, basedOn } = context.currentTurn.document;

  if (!(title && subject && keyStage && !basedOn)) {
    return true;
  }

  const hasDocumentMetadataChanged =
    title !== context.persistedState.initialDocument.title ||
    subject !== context.persistedState.initialDocument.subject ||
    keyStage !== context.persistedState.initialDocument.keyStage;

  if (hasDocumentMetadataChanged) {
    // Fetch relevant lessons and update state
    context.persistedState.relevantLessons =
      await context.runtime.fetchRelevantLessons();
    context.currentTurn.relevantLessonsFetched = true;

    if (context.persistedState.relevantLessons.length > 0) {
      await terminateWithResponse(context);
      return false;
    }
  }

  return true;
}

/**
 * Generate the final response using the presentation agent
 */
async function generateFinalResponse(
  context: AilaExecutionContext,
): Promise<void> {
  await terminateWithResponse(context);
}

/**
 * Handle errors that occur during the turn execution
 */
async function terminateWithError(
  error: { message: string },
  context: AilaExecutionContext,
): Promise<void> {
  context.currentTurn.errors.push(error);
  await terminateWithResponse(context);
}

/**
 * Generate a response message using the presentation agent
 */
async function terminateWithResponse(
  context: AilaExecutionContext,
): Promise<void> {
  const messageResult = await context.runtime.presentationAgent({
    messages: context.persistedState.messages,
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    stepsExecuted: context.currentTurn.stepsExecuted,
    errors: context.currentTurn.errors,
    plannerOutput: context.currentTurn.plannerOutput,
    relevantLessons: context.persistedState.relevantLessons,
    relevantLessonsFetched: context.currentTurn.relevantLessonsFetched,
  });

  if (messageResult.error) {
    await terminateWithGenericError(context);
    return;
  }

  await context.callbacks.onTurnComplete({
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    ailaMessage: messageResult.data.message,
  });
}

/**
 * Handle cases where the presentation agent itself fails
 */
async function terminateWithGenericError(
  context: AilaExecutionContext,
): Promise<void> {
  const genericErrorMessage =
    "We encountered an error while processing your request.";

  await context.callbacks.onTurnComplete({
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    ailaMessage: genericErrorMessage,
  });
}
