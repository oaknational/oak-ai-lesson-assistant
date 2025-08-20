// Simulated user message generator for e2e conversational tests.
// Real LLM usage can be re-enabled by injecting a client implementing SimulatedUserLLM below.

export interface SimulatedUserLLM {
  generate: (args: {
    system: string;
    user: string;
    model: string;
  }) => Promise<string>;
}

export function generateSimulatedUserMessageDeterministic(args: {
  stateDoc: Record<string, unknown>;
  lastAssistantMessage: string;
}): Promise<string> {
  const keys = Object.keys(args.stateDoc);
  if (
    !keys.includes("title") ||
    !keys.includes("subject") ||
    !keys.includes("keyStage")
  ) {
    return Promise.resolve(
      "Please add the missing title, subject, and key stage.",
    );
  }
  return Promise.resolve("Let's continue – add a learning outcome next.");
}

export async function generateSimulatedUserMessageLLM(args: {
  llm: SimulatedUserLLM;
  stateDoc: Record<string, unknown>;
  lastAssistantMessage: string;
  model?: string;
}): Promise<string> {
  const {
    llm,
    stateDoc,
    lastAssistantMessage,
    model = "gpt-4.1-2025-04-14",
  } = args;
  const system = `You simulate a proactive teacher user iteratively refining a lesson plan with an assistant.\nReturn ONLY the next user message.`;
  const user = `Assistant just said:\n${lastAssistantMessage}\n\nCurrent partial lesson JSON (may be incomplete):\n${JSON.stringify(stateDoc, null, 2)}\n\nProduce the NEXT user message.`;
  try {
    const text = await llm.generate({ system, user, model });
    return text.trim().split("\n").slice(0, 6).join(" ").slice(0, 400);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Simulated user LLM failed, falling back", e);
    return generateSimulatedUserMessageDeterministic({
      stateDoc,
      lastAssistantMessage,
    });
  }
}
