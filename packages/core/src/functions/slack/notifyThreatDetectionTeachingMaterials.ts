import { aiLogger } from "@oakai/logger";

import { inngest } from "../../inngest";
import {
  actionsBlock,
  createHeaderBlock,
  createThreatSectionBlock,
  formatThreatDetectionWithMessages,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import { notifyThreatDetectionTeachingMaterialsSchema } from "./notifyThreatDetectionTeachingMaterials.schema";

const log = aiLogger("inngest");

export const notifyThreatDetectionTeachingMaterials = inngest.createFunction(
  {
    name: "Notify in slack when a threat is detected in teaching materials",
    id: "app-slack-notify-threat-detection-teaching-materials",
  },
  { event: "app/slack.notifyThreatDetectionTeachingMaterials" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
      try {
        log.info(
          "Attempting to send Teaching Materials threat detection to Slack",
          {
            userId: event.user.id,
            id: event.data.id,
          },
        );

        const args = notifyThreatDetectionTeachingMaterialsSchema.data.parse(
          event.data,
        );

        const getSlackThreadDetectionsData = formatThreatDetectionWithMessages(
          args.threatDetection,
          event.data.messages,
        );

        const response = await slackWebClient.chat.postMessage({
          channel: slackNotificationChannelId,
          text: "Threat detected - Teaching materials",
          blocks: [
            createHeaderBlock("Threat detected - Teaching materials"),
            userIdBlock(event.user.id),
            createThreatSectionBlock({
              id: args.id,
              userInput: getSlackThreadDetectionsData.userInput,
              detectedThreats: getSlackThreadDetectionsData.detectedThreats,
              requestId: getSlackThreadDetectionsData.requestId,
              userAction: args.userAction,
            }),
            actionsBlock({ userActionsProps: { userId: event.user.id } }),
          ],
        });

        log.info(
          "Successfully sent Teaching Materials threat detection to Slack",
          {
            userId: event.user.id,
            id: args.id,
            messageTs: response.ts,
          },
        );

        return response;
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
    });
  },
);
