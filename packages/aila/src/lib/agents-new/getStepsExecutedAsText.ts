import type { AilaState } from "./agentRegistry";

/**
 * This function takes the AilaState and returns a text representation of the user's progress through the journey of making a complete document.
 * It will help the routing agent formulate an appropriate plan for Aila's turn.
 * It will output a list of all 'steps' and whether they've been called/completed yet.
 * Each step will have a status for both 'called' and 'completed'.
 *
 */
export function getStepsExecutedAsText(state: AilaState): string {
  const previousSteps = state.messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.stepsExecuted)
    .flat();
  return `## Steps executed so far in the creation of this document (most recent at the end):
${previousSteps.length === 0 ? "None" : previousSteps.map((step) => JSON.stringify(step).replace(/\n/g, "\\n")).join("\n")}
`;
}
