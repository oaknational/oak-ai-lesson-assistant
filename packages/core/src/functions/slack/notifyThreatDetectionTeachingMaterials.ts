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

export const notifyThreatDetectionTeachingMaterials = inngest.createFunction(
  {
    name: "Notify in slack when a threat is detected in teaching materials",
    id: "app-slack-notify-threat-detection-teaching-materials",
  },
  { event: "app/slack.notifyThreatDetectionTeachingMaterials" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
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

      return response;
    });
  },
);
