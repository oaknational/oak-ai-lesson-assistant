import { aiLogger } from "@oakai/logger";

import { compare } from "fast-json-patch";

import type { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";
import {
  type AilaRagRelevantLesson,
  type CompletedLessonPlan,
  type LooseLessonPlan,
  type Quiz,
} from "../../protocol/schema";
import {
  type AgentDefinition,
  type AgentName,
  agents,
  sectionAgentMap,
} from "./agents";
import { type InteractResult } from "./compatibility/streamHandling";
import { messageToUserAgent } from "./messageToUser";
import { preRoutingLogic } from "./preRoutingLogic";
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
        plan: TurnPlan | null;
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
        step: "action";
        status: "completed";
        action: {
          sectionKey: string;
          actionType: string;
          index: number;
          total: number;
        };
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

type CustomAgentAsyncFn<T> = (args: {
  document: LooseLessonPlan;
}) => Promise<T>;

export async function interact({
  chatId,
  userId,
  initialDocument,
  messageHistory,
  onUpdate,
  customAgents,
  relevantLessons,
}: {
  chatId: string;
  userId: string;
  initialDocument: LooseLessonPlan;
  messageHistory: { role: "user" | "assistant"; content: string }[];
  onUpdate?: InteractCallback;
  customAgents: {
    mathsStarterQuiz?: CustomAgentAsyncFn<Quiz>;
    mathsExitQuiz?: CustomAgentAsyncFn<Quiz>;
    fetchRagData: CustomAgentAsyncFn<CompletedLessonPlan[]>;
  };
  relevantLessons: AilaRagRelevantLesson[] | null;
}): Promise<InteractResult> {
  log.info("Starting interaction with Aila agents");
  let document = initialDocument;
  // Notify about starting the routing process
  onUpdate?.({
    type: "progress",
    data: { step: "routing", status: "started" },
  });

  let ragData: CompletedLessonPlan[] = [];
  if (relevantLessons === null) {
    /**
     * This means we haven't even tried to fetch relevant lessons yet
     * So we need to do that first, and present them to the user
     * to decide if they want to use one of them as a base.
     */
    onUpdate?.({
      type: "progress",
      data: {
        step: "routing",
        status: "completed",
        plan: null,
      },
    });
    ragData =
      (await customAgents.fetchRagData({
        document,
      })) ?? [];

    const ailaMessage = ragData.length
      ? `If you would like to base your lesson on one of the following:\n${ragData.map((rl, i) => `${i + 1}. ${rl.title}`).join(`\n`)}\n\nPlease reply with the number of the lesson you would like to use as a base.\n\nOtherwise click 'continue'.`
      : `We couldn't find any relevant lessons!!`;
    onUpdate?.({
      type: "complete",
      data: {
        document,
        ailaMessage,
      },
    });

    return { document, ailaMessage };
  }

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
    onUpdate?.({
      type: "progress",
      data: {
        step: "routing",
        status: "completed",
        plan: null,
      },
    });
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
    const agentDefinition = agents[agentName({ lessonPlan: document })];

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
        // handle asyncFunction agents
        if (agentDefinition.type === "asyncFunction") {
          if (agentDefinition.name) {
            if (agentDefinition.name === "mathsStarterQuiz") {
              const quiz = await customAgents.mathsStarterQuiz?.({
                document,
              });
              if (!quiz) {
                throw new Error("Maths starter quiz returned null");
              }

              const patch: JsonPatchDocumentOptional = {
                type: "patch",
                value: {
                  path: `/${sectionKey}`,
                  op: actionType,
                  value: quiz,
                },
                status: "complete",
                // @todo improve 'reasoning here
                reasoning: `Updated ${sectionKey} based on user request`,
              };
              const patches = [patch];
              document = {
                ...document,
                [sectionKey]: quiz,
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
            } else if (agentDefinition.name === "mathsExitQuiz") {
              const quiz = await customAgents.mathsExitQuiz?.({
                document,
              });
              if (!quiz) {
                throw new Error("Maths starter quiz returned null");
              }

              const patch: JsonPatchDocumentOptional = {
                type: "patch",
                value: {
                  path: `/${sectionKey}`,
                  op: actionType,
                  value: quiz,
                },
                status: "complete",
                // @todo improve 'reasoning here
                reasoning: `Updated ${sectionKey} based on user request`,
              };
              const patches = [patch];
              document = {
                ...document,
                [sectionKey]: quiz,
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
            } else if (agentDefinition.name === "basedOn") {
              const userMessage = messageHistory.findLast(
                (m) => m.role === "user",
              );
              const userBasedOnSelection = Number(userMessage?.content?.trim());
              if (relevantLessons === null) {
                continue;
              }
              const userBasedOnSelectionIsInvalid =
                isNaN(userBasedOnSelection) ||
                userBasedOnSelection < 1 ||
                userBasedOnSelection > relevantLessons.length;
              if (userBasedOnSelectionIsInvalid) {
                continue;
              }
              const chosenBasedOn = relevantLessons[userBasedOnSelection];
              if (!chosenBasedOn) {
                throw new Error("Unexpected chosenBasedOn missing");
              }
              const basedOnValue = {
                id: chosenBasedOn.lessonPlanId,
                title: chosenBasedOn.title,
              };
              const patch: JsonPatchDocumentOptional = {
                type: "patch",
                value: {
                  path: `/${sectionKey}`,
                  op: actionType,
                  value: basedOnValue,
                },
                status: "complete",
                // @todo improve 'reasoning here
                reasoning: `Updated ${sectionKey} based on user request`,
              };
              const patches = [patch];
              document = {
                ...document,
                [sectionKey]: basedOnValue,
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
          }
        }

        if (!("prompt" in agentDefinition)) {
          throw new Error(
            `Unable to process '${actionType}' action. No prompt found`,
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
          ragData,
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
