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

export const notifyThreatDetectionAila = inngest.createFunction(
  {
    name: "Notify in slack when a threat is detected in Aila chat",
    id: "app-slack-notify-threat-detection-aila",
  },
  { event: "app/slack.notifyThreatDetectionAila" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
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

      return response;
    });
  },
);
