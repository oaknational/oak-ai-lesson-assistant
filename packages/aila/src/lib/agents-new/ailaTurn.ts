import type { AilaState } from "./agentRegistry";

export type { AilaState };

export type AilaTurnArgs = {
  state: Omit<AilaState, "currentTurn">;
};
type AilaTurnResult = {
  state: AilaState;
};

export async function ailaTurn({
  state,
}: AilaTurnArgs): Promise<AilaTurnResult> {
  const { planner, messageToUser } = state;

  let currentState: AilaState = {
    ...state,
    currentTurn: {
      stepsExecuted: [],
      directResponse: null,
    },
  };
  // Plan the turn
  const plannerResult = await planner.handler(currentState);
  console.log(plannerResult.plan);
  currentState = { ...currentState, ...plannerResult };
  if (currentState.error) return await handleError(currentState);
  // Execute the plan
  for (const step of currentState.plan) {
    console.log(currentState.currentTurn.stepsExecuted, "this step:", step);
    const agent = currentState.agents[step.agentId];

    if (!agent) {
      currentState.error = {
        message: `Agent not found: ${step.agentId}`,
      };
      return await handleError(currentState);
    }

    switch (agent.id) {
      /**
       * Handle agents that require arguments (needs to be separate to satisfy TypeScript)
       */
      case "deleteSection":
        if (step.agentId !== "deleteSection") {
          currentState.error = {
            message: `Invalid agent for deleteSection: ${step.agentId}`,
          };
          return await handleError(currentState);
        }
        currentState = await agent.handler(currentState, step.args);
        break;

      case "fetchRelevantLessons":
        if (step.agentId !== "fetchRelevantLessons") {
          currentState.error = {
            message: `Invalid agent for fetchRelevantLessons: ${step.agentId}`,
          };
          return await handleError(currentState);
        }
        currentState = await agent.handler(currentState);
        break;

      default:
        /**
         * Handle all other agents
         */
        currentState = await agent.handler(currentState);
        break;
    }

    if (currentState.error) {
      return await handleError(currentState);
    }

    // Register the step execution
    currentState = {
      ...currentState,
      currentTurn: {
        ...currentState.currentTurn,
        stepsExecuted: [...currentState.currentTurn.stepsExecuted, step],
      },
    };
  }

  /**
   * Sign off with the message to the user.
   * It is done conditionally as currently the Retrieval agent adds its own custom message.
   */
  if (
    currentState.messages[currentState.messages.length - 1]?.role !==
    "assistant"
  ) {
    currentState = await messageToUser.handler(currentState);
  }

  return {
    state: currentState,
  };
}

/**
 * Handle errors that occur during the Aila turn.
 * @param state The current state of the Aila turn.
 * @returns A promise that resolves with the current state.
 * Should always be returned from the main function to ensure
 * that errors are handled gracefully.
 */
async function handleError(state: AilaState): Promise<AilaTurnResult> {
  try {
    console.error("Error during Aila turn:", state.error);
    const { messageToUser } = state;

    const messageAgentResult = await messageToUser.handler(state);

    return { state: { ...state, ...messageAgentResult } };
  } catch (error) {
    /**
     * TODO confirm that this doesn't leave state in a weird place re error and assistant message
     */
    console.error("Error in messageToUser agent:", error);
    return {
      state: {
        ...state,
        error: {
          message: `Failed to handle error: ${error instanceof Error ? error.message : String(error)}`,
        },
      },
    };
  }
}
