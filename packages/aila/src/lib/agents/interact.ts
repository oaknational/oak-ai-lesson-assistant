import { aiLogger } from "@oakai/logger";

import { compare } from "fast-json-patch/index.mjs";

import { type LooseLessonPlan } from "../../protocol/schema";
import { agents, sectionAgentMap } from "./agents";
import { messageToUserAgent } from "./messageToUser";
import { promptAgentHandler } from "./promptAgentHandler";
import { agentRouter } from "./router";

const log = aiLogger("aila:agents");

export async function interact({
  chatId,
  userId,
  initialDocument,
  messageHistory,
}: {
  chatId: string;
  userId: string;
  initialDocument: LooseLessonPlan;
  messageHistory: { role: "user" | "assistant"; content: string }[];
}): Promise<{ document: LooseLessonPlan; ailaMessage?: string }> {
  log.info("Starting interaction with Aila agents");
  let document = initialDocument;

  const routerResponse = await agentRouter({
    chatId,
    userId,
    document,
    messageHistory,
  });

  log.info("Router response", JSON.stringify(routerResponse, null, 2));

  if (!routerResponse) {
    throw new Error("Router returned null");
  }

  const result = routerResponse.result;

  if (result.type === "end_turn") {
    return { document, ailaMessage: result.message };
  }

  const { plan } = result;

  for (const action of plan) {
    log.info("Processing action", action);
    const { sectionKey, action: actionType, context } = action;
    const agentName = sectionAgentMap[sectionKey];
    const agentDefinition = agents[agentName];

    switch (actionType) {
      case "delete":
        // Delete the section from the document
        if (document[sectionKey]) {
          delete document[sectionKey];
        }
        break;
      case "add":
      case "replace":
        // Add or edit the section in the document
        document = await promptAgentHandler({
          agent: agentDefinition,
          document,
          targetKey: sectionKey,
          chatId,
          userId,
          additionalInstructions: context,
        });
        break;
      default:
        throw new Error(
          `Unknown action type: ${actionType as string}. Expected "add", "replace", or "delete".`,
        );
    }
  }

  const jsonDiff = JSON.stringify(compare(initialDocument, document));

  log.info("JSON diff", jsonDiff);

  const messageResult = await messageToUserAgent({
    chatId,
    userId,
    document,
    jsonDiff,
    messageHistory,
  });

  if (!messageResult) {
    throw new Error("Message to user agent returned null");
  }

  return { document, ailaMessage: messageResult.message };
}
