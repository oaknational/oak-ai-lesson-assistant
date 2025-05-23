import { aiLogger } from "@oakai/logger";

import { compare } from "fast-json-patch";

import type { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";
import { type LooseLessonPlan } from "../../protocol/schema";
import { agents, sectionAgentMap } from "./agents";
import { type InteractResult } from "./compatibility/streamHandling";
import { messageToUserAgent } from "./messageToUser";
import { promptAgentHandler } from "./promptAgentHandler";
import { type TurnPlan, agentRouter } from "./router";

const log = aiLogger("aila:agents");

type InteractUpdate =
  | {
      type: "progress";
      data: {
        step: "routing";
        status: "started";
      };
    }
  | {
      type: "progress";
      data: {
        step: "routing";
        status: "completed";
        plan: TurnPlan;
      };
    }
  | {
      type: "progress";
      data: {
        step: "action";
        status: "started" | "completed";
        action: {
          sectionKey: string;
          actionType: string;
          index: number;
          total: number;
        };
      };
    }
  | {
      type: "section_update";
      data: {
        sectionKey: string;
        actionType: string;
        patches: JsonPatchDocumentOptional[];
      };
    }
  | {
      type: "progress";
      data: {
        step: "message";
        status: "started";
      };
    }
  | {
      type: "complete";
      data: {
        document: LooseLessonPlan;
        ailaMessage: string;
      };
    };
export type InteractCallback = <Update extends InteractUpdate>(
  update: Update,
) => void;

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

  if (routerResponse.result.type === "end_turn") {
    // Notify about completion
    onUpdate?.({
      type: "complete",
      data: { document, ailaMessage: routerResponse.result.message },
    });

    return { document, ailaMessage: routerResponse.result.message };
  }

  // Notify about completed routing
  onUpdate?.({
    type: "progress",
    data: { step: "routing", status: "completed", plan: routerResponse.result },
  });

  const result = routerResponse.result;

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
      case "replace": {
        if (!("prompt" in agentDefinition)) {
          throw new Error(
            `Unable to process 'replace' action. No prompt found`,
          );
        }
        // Add or edit the section in the document
        const response = await promptAgentHandler({
          agent: agentDefinition,
          document,
          targetKey: sectionKey,
          chatId,
          userId,
          additionalInstructions: context,
        });

        const patch: JsonPatchDocumentOptional = {
          type: "patch",
          value: {
            path: `/${sectionKey}`,
            op: actionType,
            value: response.content,
          },
          status: "complete",
          // @todo improve 'reasoning here
          reasoning: `Updated ${sectionKey} based on user request`,
        };
        const patches = [patch];

        document = {
          ...document,
          [sectionKey]: response.content,
        };

        // Send section update with current state
        onUpdate?.({
          type: "section_update",
          data: {
            sectionKey,
            actionType,
            patches,
          },
        });
        break;
      }
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
