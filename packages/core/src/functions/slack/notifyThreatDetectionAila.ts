import { aiLogger } from "@oakai/logger";

import {
  actionsBlock,
  chatLinkBlock,
  createHeaderBlock,
  createThreatSectionBlock,
  formatThreatDetectionResultWithMessages,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import type { NotifyThreatDetectionAilaInput } from "./notifyThreatDetectionAila.schema";

const log = aiLogger("core");

export async function notifyThreatDetectionAila(
  event: NotifyThreatDetectionAilaInput,
) {
  try {
    const args = event.data;

    log.info("Attempting to send Aila threat detection to Slack", {
      userId: event.user.id,
      chatId: args.chatId,
    });

    const slackThreatDetectionSummary = formatThreatDetectionResultWithMessages(
      args.threatDetection,
      event.data.messages,
    );

    const response = await slackWebClient.chat.postMessage({
      channel: slackNotificationChannelId,
      text: "Threat detected - Aila",
      blocks: [
        createHeaderBlock("Threat detected - Aila"),
        userIdBlock(event.user.id),
        chatLinkBlock(args.chatId),
        createThreatSectionBlock({
          id: args.chatId,
          userInput: slackThreatDetectionSummary.userInput,
          detectedThreats: slackThreatDetectionSummary.detectedThreats,
          requestId: slackThreatDetectionSummary.requestId,
          userAction: args.userAction,
        }),
        actionsBlock({
          userActionsProps: { userId: event.user.id },
          chatActionsProps: { chatId: args.chatId },
        }),
      ],
    });

    log.info("Successfully sent Aila threat detection to Slack", {
      userId: event.user.id,
      chatId: args.chatId,
      messageTs: response.ts,
    });
  } catch (error) {
    log.error(
      "Failed to send Aila threat detection to Slack",
      {
        userId: event.user.id,
        chatId: event.data.chatId,
        error: error instanceof Error ? error.message : String(error),
      },
      error,
    );
    throw new Error("Failed to send Aila threat detection to Slack", {
      cause: error,
    });
  }
}
