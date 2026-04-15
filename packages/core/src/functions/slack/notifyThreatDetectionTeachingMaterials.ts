import { aiLogger } from "@oakai/logger";

import {
  actionsBlock,
  createHeaderBlock,
  createThreatSectionBlock,
  formatThreatDetectionResultWithMessages,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import type { NotifyThreatDetectionTeachingMaterialsInput } from "./notifyThreatDetectionTeachingMaterials.schema";

const log = aiLogger("core");

export async function notifyThreatDetectionTeachingMaterials(
  event: NotifyThreatDetectionTeachingMaterialsInput,
) {
  try {
    const args = event.data;

    log.info(
      "Attempting to send Teaching Materials threat detection to Slack",
      {
        userId: event.user.id,
        id: args.id,
      },
    );

    const slackThreatDetectionSummary = formatThreatDetectionResultWithMessages(
      args.threatDetection,
      event.data.messages,
    );

    const showLakeraConsole =
      args.threatDetection.provider === "lakera" ? new Date() : undefined;

    const response = await slackWebClient.chat.postMessage({
      channel: slackNotificationChannelId,
      text: "Threat detected - Teaching materials",
      blocks: [
        createHeaderBlock("Threat detected - Teaching materials"),
        userIdBlock(event.user.id),
        createThreatSectionBlock({
          id: args.id,
          userInput: slackThreatDetectionSummary.userInput,
          detectedThreats: slackThreatDetectionSummary.detectedThreats,
          requestId: slackThreatDetectionSummary.requestId,
          userAction: args.userAction,
        }),
        actionsBlock({
          userActionsProps: { userId: event.user.id },
          lakeraConsoleTimestamp: showLakeraConsole,
        }),
      ],
    });

    log.info("Successfully sent Teaching Materials threat detection to Slack", {
      userId: event.user.id,
      id: args.id,
      messageTs: response.ts,
    });
  } catch (error) {
    log.error(
      "Failed to send Teaching Materials threat detection to Slack",
      {
        userId: event.user.id,
        id: event.data.id,
        error: error instanceof Error ? error.message : String(error),
      },
      error,
    );
    throw new Error(
      "Failed to send Teaching Materials threat detection to Slack",
      { cause: error },
    );
  }
}
