import { inngest } from "../../inngest";
import {
  actionsBlock,
  createHeaderBlock,
  createModerationSectionBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import { notifyModerationTeachingMaterialsSchema } from "./notifyModerationTeachingMaterials.schema";

export const notifyModerationTeachingMaterials = inngest.createFunction(
  {
    name: "Notify in slack when toxic user input is detected in teaching materials",
    id: "app-slack-notify-moderation-teaching-materials",
  },
  { event: "app/slack.notifyModerationTeachingMaterials" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
      const args = notifyModerationTeachingMaterialsSchema.data.parse(
        event.data,
      );

      const response = await slackWebClient.chat.postMessage({
        channel: slackNotificationChannelId,
        text: "Toxic user input detected - Teaching materials",
        blocks: [
          createHeaderBlock("Toxic user input detected - Teaching materials"),
          userIdBlock(event.user.id),
          createModerationSectionBlock({
            id: args.id,
            justification: args.justification,
            categories: args.categories,
            userAction: args.userAction,
            violationType: "MODERATION",
          }),
          actionsBlock({ userActionsProps: { userId: event.user.id } }),
        ],
      });

      return response;
    });
  },
);
