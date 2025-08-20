import { sectionStepToAgentId } from "./sectionAgent/sectionStepToAgentId";
import type { AilaCurrentTurn, AilaState } from "./types";

export type AilaTurnArgs = {
  config: {
    mathsQuizEnabled: boolean;
  };
  state: Omit<AilaState, "currentTurn">;
};
type AilaTurnResult = {
  state: AilaState;
  currentTurn: AilaCurrentTurn;
};

export async function ailaTurn({
  config,
  state,
}: AilaTurnArgs): Promise<AilaTurnResult> {
  const { plannerAgent, sectionAgents, initialDocument } = state;

  const currentTurn: AilaCurrentTurn = {
    document: initialDocument,
    plannerOutput: null,
    errors: [],
    stepsExecuted: [],
    relevantLessonsFetched: false,
  };

  /**
   * 1. Otherwise, we call the planner agent which will output the plan for Aila's turn
   */
  const plannerResponse = await plannerAgent({
    messages: state.messages,
    document: state.initialDocument,
    relevantLessons: state.relevantLessons,
  });
  if (plannerResponse.error) {
    /**
     * If the planner agent encounters an error, we pass that to the presentation agent.
     * 👉 The turn ends here.
     */
    return endWithError(plannerResponse.error, { state, currentTurn });
  } else {
    currentTurn.plannerOutput = plannerResponse.data;
  }
  /**
   * 2. If the planner outputs an 'exit' decision, we pass that directly to the presentation agent to write an appropriate response.
   * 👉 The turn ends here.
   */
  if (currentTurn.plannerOutput.decision === "exit") {
    return endWithMessage({ state, currentTurn });
  }
  /**
   * 5. If the planner outputs a 'plan' decision, we loop through the plan steps, executing them sequentially.
   * Each step (section, action) is handled by the appropriate agent.
   */
  for (const step of currentTurn.plannerOutput.plan) {
    currentTurn.stepsExecuted.push(step);

    if (step.action === "delete") {
      // delete!
      delete currentTurn.document[step.sectionKey];
      continue;
    }

    // generate!
    const agentId = sectionStepToAgentId(step, {
      config,
      document: currentTurn.document,
    });
    const agent = sectionAgents[agentId];
    const result = await agent.handler({ state, currentTurn });
    if (result.error) {
      return endWithError(result.error, { state, currentTurn });
    }
    currentTurn.document = {
      ...currentTurn.document,
      [step.sectionKey]: result.data,
    };
  }
  /**
   * 1. If the RAG input hash is stale AND no 'based on' lesson is set, we need to re-fetch the relevant lessons.
   * We then show the relevant lessons to the user to choose a 'based on' lesson.
   * 👉 The turn ends here.
   */
  const { title, subject, keyStage, basedOn } = currentTurn.document;
  if (title && subject && keyStage && !basedOn) {
    // We should do a hash with fuzzy similarity, but for now just check for changes
    if (
      title !== currentTurn.document.title ||
      subject !== currentTurn.document.subject ||
      keyStage !== currentTurn.document.keyStage
    ) {
      // Fetch and show relevant lessons
      state.relevantLessons = await state.fetchRelevantLessons();
      currentTurn.relevantLessonsFetched = true;

      if (state.relevantLessons.length > 0) {
        return endWithMessage({ state, currentTurn });
      }
    }
  }
  /**
   * 6. After the plan is executed, we call the presentation agent.
   * 👉 The turn ends here.
   */
  return endWithMessage({ state, currentTurn });
}

/**
 * Handle errors that occur during the Aila turn.
 * @param state The current state of the Aila turn.
 * @returns A promise that resolves with the current state.
 * Should always be returned from the main function to ensure
 * that errors are handled gracefully.
 */
async function endWithError(
  error: { message: string },
  { state, currentTurn }: { state: AilaState; currentTurn: AilaCurrentTurn },
): Promise<AilaTurnResult> {
  try {
    console.error("Error during Aila turn:", error.message);
    currentTurn.errors.push(error);

    const messageAgentResult = await state.presentationAgent({
      messages: state.messages,
      prevDoc: state.initialDocument,
      nextDoc: currentTurn.document,
      stepsExecuted: currentTurn.stepsExecuted,
      errors: currentTurn.errors,
      plannerOutput: currentTurn.plannerOutput,
      relevantLessons: state.relevantLessons,
      relevantLessonsFetched: currentTurn.relevantLessonsFetched,
    });

    if (messageAgentResult.error) {
      throw new Error(error.message);
    }

    return appendAssistantMessageToState(
      {
        state,
        currentTurn,
      },
      messageAgentResult.data.message,
    );
  } catch (error) {
    console.error("Error in messageToUser agent:", error);
    return appendGenericErrorToState({
      state,
      currentTurn,
    });
  }
}

/**
 * Convenience function to end the turn with a message.
 * Calls presentation agent to get a response message, and appends it to the state.
 */
async function endWithMessage({
  state,
  currentTurn,
}: {
  state: AilaState;
  currentTurn: AilaCurrentTurn;
}): Promise<AilaTurnResult> {
  try {
    const messageAgentResult = await state.presentationAgent({
      messages: state.messages,
      prevDoc: state.initialDocument,
      nextDoc: currentTurn.document,
      stepsExecuted: currentTurn.stepsExecuted,
      errors: currentTurn.errors,
      plannerOutput: currentTurn.plannerOutput,
      relevantLessons: state.relevantLessons,
      relevantLessonsFetched: currentTurn.relevantLessonsFetched,
    });

    if (messageAgentResult.error) {
      throw new Error(messageAgentResult.error.message);
    } else {
      state.messages.push({
        role: "assistant",
        content: messageAgentResult.data.message,
      });
    }

    return { state, currentTurn };
  } catch (error) {
    console.error("Error in messageToUser agent:", error);
    return appendGenericErrorToState({
      state,
      currentTurn,
    });
  }
}

function appendAssistantMessageToState<T extends { state: AilaState }>(
  props: T,
  message: string,
) {
  props.state.messages.push({
    role: "assistant",
    content: message,
  });
  return props;
}

function appendGenericErrorToState<T extends { state: AilaState }>(props: T) {
  return appendAssistantMessageToState(
    props,
    "We encountered an error while processing your request.",
  );
}
