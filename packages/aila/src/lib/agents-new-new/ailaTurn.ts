import { sectionStepToAgentId } from "./sectionAgent/sectionStepToAgentId";
import type {
  AilaExecutionContext,
  AilaTurnArgs,
  AilaTurnResult,
} from "./types";

export async function ailaTurn({
  persistedState,
  runtime,
}: AilaTurnArgs): Promise<AilaTurnResult> {
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
  };

  /**
   * 1. Otherwise, we call the planner agent which will output the plan for Aila's turn
   */
  const plannerResponse = await context.runtime.plannerAgent({
    messages: context.persistedState.messages,
    document: context.persistedState.initialDocument,
    relevantLessons: context.persistedState.relevantLessons,
  });
  if (plannerResponse.error) {
    /**
     * If the planner agent encounters an error, we pass that to the presentation agent.
     * 👉 The turn ends here.
     */
    return endWithError(plannerResponse.error, context);
  } else {
    context.currentTurn.plannerOutput = plannerResponse.data;
  }
  /**
   * 2. If the planner outputs an 'exit' decision, we pass that directly to the presentation agent to write an appropriate response.
   * 👉 The turn ends here.
   */
  if (context.currentTurn.plannerOutput.decision === "exit") {
    return endWithMessage(context);
  }
  /**
   * 5. If the planner outputs a 'plan' decision, we loop through the plan steps, executing them sequentially.
   * Each step (section, action) is handled by the appropriate agent.
   */
  for (const step of context.currentTurn.plannerOutput.plan) {
    context.currentTurn.stepsExecuted.push(step);

    if (step.action === "delete") {
      // delete!
      delete context.currentTurn.document[step.sectionKey];
      continue;
    }

    // generate!
    const agentId = sectionStepToAgentId(step, {
      config: context.runtime.config,
      document: context.currentTurn.document,
    });
    const agent = context.runtime.sectionAgents[agentId];
    const result = await agent.handler(context);
    if (result.error) {
      return endWithError(result.error, context);
    }
    context.currentTurn.document = {
      ...context.currentTurn.document,
      [step.sectionKey]: result.data,
    };
  }
  /**
   * 1. If the RAG input hash is stale AND no 'based on' lesson is set, we need to re-fetch the relevant lessons.
   * We then show the relevant lessons to the user to choose a 'based on' lesson.
   * 👉 The turn ends here.
   */
  const { title, subject, keyStage, basedOn } = context.currentTurn.document;
  if (title && subject && keyStage && !basedOn) {
    // We should do a hash with fuzzy similarity, but for now just check for changes
    if (
      title !== context.currentTurn.document.title ||
      subject !== context.currentTurn.document.subject ||
      keyStage !== context.currentTurn.document.keyStage
    ) {
      // Fetch and show relevant lessons - MUTATES persistedState
      context.persistedState.relevantLessons =
        await context.runtime.fetchRelevantLessons();
      context.currentTurn.relevantLessonsFetched = true;

      if (context.persistedState.relevantLessons.length > 0) {
        return endWithMessage(context);
      }
    }
  }
  /**
   * 6. After the plan is executed, we call the presentation agent.
   * 👉 The turn ends here.
   */
  return endWithMessage(context);
}

/**
 * Handle errors that occur during the Aila turn.
 * @param error The error that occurred.
 * @param context The current execution context.
 * @returns A promise that resolves with the current state.
 * Should always be returned from the main function to ensure
 * that errors are handled gracefully.
 */
async function endWithError(
  error: { message: string },
  context: AilaExecutionContext,
): Promise<AilaTurnResult> {
  context.currentTurn.errors.push(error);

  const messageAgentResult = await context.runtime.presentationAgent({
    messages: context.persistedState.messages,
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    stepsExecuted: context.currentTurn.stepsExecuted,
    errors: context.currentTurn.errors,
    plannerOutput: context.currentTurn.plannerOutput,
    relevantLessons: context.persistedState.relevantLessons,
    relevantLessonsFetched: context.currentTurn.relevantLessonsFetched,
  });

  if (messageAgentResult.error) {
    context.currentTurn.errors.push({
      message: "Error in presentation agent during error handling",
    });
    return appendGenericErrorToState(context);
  }

  return appendAssistantMessageToState(
    context,
    messageAgentResult.data.message,
  );
}

async function endWithMessage(
  context: AilaExecutionContext,
): Promise<AilaTurnResult> {
  const messageAgentResult = await context.runtime.presentationAgent({
    messages: context.persistedState.messages,
    prevDoc: context.persistedState.initialDocument,
    nextDoc: context.currentTurn.document,
    stepsExecuted: context.currentTurn.stepsExecuted,
    errors: context.currentTurn.errors,
    plannerOutput: context.currentTurn.plannerOutput,
    relevantLessons: context.persistedState.relevantLessons,
    relevantLessonsFetched: context.currentTurn.relevantLessonsFetched,
  });

  if (messageAgentResult.error) {
    context.currentTurn.errors.push({ message: "Error in presentation agent" });
    return appendGenericErrorToState(context);
  } else {
    // MUTATES persistedState
    context.persistedState.messages.push({
      role: "assistant",
      content: messageAgentResult.data.message,
    });
  }

  return {
    persistedState: context.persistedState,
    currentTurn: context.currentTurn,
  };
}

function appendAssistantMessageToState(
  context: AilaExecutionContext,
  message: string,
): AilaTurnResult {
  // MUTATES persistedState
  context.persistedState.messages.push({
    role: "assistant",
    content: message,
  });
  return {
    persistedState: context.persistedState,
    currentTurn: context.currentTurn,
  };
}

function appendGenericErrorToState(
  context: AilaExecutionContext,
): AilaTurnResult {
  return appendAssistantMessageToState(
    context,
    "We encountered an error while processing your request.",
  );
}
