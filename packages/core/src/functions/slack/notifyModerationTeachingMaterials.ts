import { inngest } from "../../inngest";
import {
  actionsBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import { notifyModerationTeachingMaterialsSchema } from "./notifyModerationTeachingMaterials.schema";

export const notifyModerationTeachingMaterials = inngest.createFunction(
  {
    name: "Notify in slack when a user's input is flagged for moderation in teaching materials",
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
        text: "Toxic user input detected",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Toxic user input detected - Teaching materials",
            },
          },
          userIdBlock(event.user.id),
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Id*: ${args.id}`,
              },
              {
                type: "mrkdwn",
                text: `*Justification*: ${args.justification}`,
              },
              {
                type: "mrkdwn",
                text: `*Categories*: \`${args.categories.join("`, `")}\``,
              },
              {
                type: "mrkdwn",
                text: `*User action*:  ${args.userAction}`,
              },
              {
                type: "mrkdwn",
                text: `*Violation type*:  ${args.violationType}`,
              },
            ],
          },
          actionsBlock({ userActionsProps: { userId: event.user.id } }),
        ],
      });

      return response;
    });
  },
);
