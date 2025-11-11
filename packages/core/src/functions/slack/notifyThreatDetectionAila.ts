import { aiLogger } from "@oakai/logger";

import { inngest } from "../../inngest";
import {
  actionsBlock,
  chatLinkBlock,
  createHeaderBlock,
  createThreatSectionBlock,
  formatThreatDetectionWithMessages,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import { notifyThreatDetectionAilaSchema } from "./notifyThreatDetectionAila.schema";

const log = aiLogger("inngest");

export const notifyThreatDetectionAila = inngest.createFunction(
  {
    name: "Notify in slack when a threat is detected in Aila chat",
    id: "app-slack-notify-threat-detection-aila",
  },
  { event: "app/slack.notifyThreatDetectionAila" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
      try {
        log.info("Attempting to send Aila threat detection to Slack", {
          userId: event.user.id,
          chatId: event.data.chatId,
        });

        const args = notifyThreatDetectionAilaSchema.data.parse(event.data);

        const getSlackThreadDetectionsData = formatThreatDetectionWithMessages(
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
              userInput: getSlackThreadDetectionsData.userInput,
              detectedThreats: getSlackThreadDetectionsData.detectedThreats,
              requestId: getSlackThreadDetectionsData.requestId,
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

        return response;
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
    });
  },
);
