import invariant from "tiny-invariant";

import type { AilaState } from "./agentRegistry";

type AilaTurnArgs = {
  state: AilaState;
};
type AilaTurnResult = {
  state: AilaState;
};

export async function ailaTurn({
  state,
}: AilaTurnArgs): Promise<AilaTurnResult> {
  const { planner, agents } = state;
  // Validate the agents
  const chatMessageAgent = agents["messageToUser"];
  invariant(chatMessageAgent, "messageToUser agent must be defined");

  let currentState = { ...state };
  // Plan the turn
  const plannerResult = await planner.handler(currentState);
  currentState = { ...currentState, ...plannerResult };
  if (currentState.error) return await handleError(currentState);
  // Execute the plan
  for (const step of currentState.plan) {
    const agent = currentState.agents[step.agentId];

    if (!agent) {
      currentState.error = `Agent not found: ${step.agentId}`;
      return await handleError(currentState);
    }

    /**
     * Handle agents that require arguments.
     */
    if (agent.id === "deleteSection") {
      if (step.agentId !== "deleteSection") {
        currentState.error = `Invalid agent for deleteSection: ${step.agentId}`;
        return await handleError(currentState);
      }
      await agent.handler(state, step.args);
      continue;
    }

    const result = await agent.handler(currentState);
    currentState = { ...currentState, ...result };

    console.log(currentState);
    if (currentState.error) return await handleError(currentState);
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
    const chatMessageAgent = state.agents["messageToUser"];

    const messageAgentResult = await chatMessageAgent.handler(state);

    return { state: { ...state, ...messageAgentResult } };
  } catch (error) {
    console.error("Error in messageToUser agent:", error);
    return {
      state: {
        ...state,
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `Something went wrong while processing your request. Please try again later.`,
          },
        ],
        error: `Failed to handle error: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
}
