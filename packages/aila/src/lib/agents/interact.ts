import { aiLogger } from "@oakai/logger";

import { compare } from "fast-json-patch";

import { type LooseLessonPlan } from "../../protocol/schema";
import { agents, sectionAgentMap } from "./agents";
import { messageToUserAgent } from "./messageToUser";
import { promptAgentHandler } from "./promptAgentHandler";
import { agentRouter } from "./router";
import { createPatchesFromInteractResult } from "./streamHandling";
import type { InteractResult } from "./streamHandling";

const log = aiLogger("aila:agents");

export type InteractCallback = (update: {
  type: "progress" | "section_update" | "complete";
  data: any;
}) => void;

export async function interact({
  chatId,
  userId,
  initialDocument,
  messageHistory,
  onUpdate,
}: {
  chatId: string;
  userId: string;
  initialDocument: LooseLessonPlan;
  messageHistory: { role: "user" | "assistant"; content: string }[];
  onUpdate?: InteractCallback;
}): Promise<InteractResult> {
  log.info("Starting interaction with Aila agents");
  let document = initialDocument;

  // Notify about starting the routing process
  onUpdate?.({
    type: "progress",
    data: { step: "routing", status: "started" },
  });

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

  // Notify about completed routing
  onUpdate?.({
    type: "progress",
    data: { step: "routing", status: "completed", plan: routerResponse.result },
  });

  const result = routerResponse.result;

  if (result.type === "end_turn") {
    return { document, ailaMessage: result.message };
  }

  const { plan } = result;

  for (const [index, action] of plan.entries()) {
    log.info("Processing action", action);
    const { sectionKey, action: actionType, context } = action;
    const agentName = sectionAgentMap[sectionKey];
    const agentDefinition = agents[agentName];

    // Notify about starting an action
    onUpdate?.({
      type: "progress",
      data: {
        step: "action",
        status: "started",
        action: { sectionKey, actionType, index, total: plan.length },
      },
    });

    switch (actionType) {
      case "delete":
        // Delete the section from the document
        if (document[sectionKey]) {
          delete document[sectionKey];
        }
        break;
      case "add":
      case "replace":
        if (!("prompt" in agentDefinition)) {
          throw new Error(
            `Unable to process 'replace' action. No prompt found`,
          );
        }
        // Add or edit the section in the document
        document = await promptAgentHandler({
          agent: agentDefinition,
          document,
          targetKey: sectionKey,
          chatId,
          userId,
          additionalInstructions: context,
        });

        // Create patches to represent the changes made to this section
        const currentPatches = createPatchesFromInteractResult(
          initialDocument,
          { document },
        );

        // Send section update with current state
        onUpdate?.({
          type: "section_update",
          data: {
            sectionKey,
            actionType,
            patches: currentPatches.patches.filter(
              (p) => p.value.path.substring(1) === sectionKey,
            ),
          },
        });
        break;
      default:
        throw new Error(
          `Unknown action type: ${actionType as string}. Expected "add", "replace", or "delete".`,
        );
    }

    // Notify about completed action
    onUpdate?.({
      type: "progress",
      data: {
        step: "action",
        status: "completed",
        action: { sectionKey, actionType, index, total: plan.length },
      },
    });
  }

  // Notify about starting the message generation
  onUpdate?.({
    type: "progress",
    data: { step: "message", status: "started" },
  });

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

  // Notify about completion
  onUpdate?.({
    type: "complete",
    data: { document, ailaMessage: messageResult.message },
  });

  return { document, ailaMessage: messageResult.message };
}
