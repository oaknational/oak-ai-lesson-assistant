import { inngest } from "../../client";
import {
  slackNotificationChannelId,
  slackWebClient,
  actionsBlock,
  userIdBlock,
} from "../../utils/slack";
import { getExternalFacingUrl } from "./getExternalFacingUrl";
import { notifyModerationSchema } from "./notifyModeration.schema";

// Example event data:
// {
//   "chatId": "chat_abc",
//   "userId": "user_abc",
//   "justification": "This is a justification",
//   "categories": ["t/category1", "u/category2"]
// }

export const notifyModeration = inngest.createFunction(
  {
    name: "Notify in slack when a user's input is flagged for moderation",
    id: "app-slack-notify-moderation",
  },
  { event: "app/slack.notifyModeration" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
      const args = notifyModerationSchema.data.parse(event.data);

      const response = await slackWebClient.chat.postMessage({
        channel: slackNotificationChannelId,
        text: "Toxic user input detected",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Toxic user input detected",
            },
          },
          userIdBlock(event.user.id),
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Chat*: <https://${getExternalFacingUrl()}/aila/${args.chatId}|aila/${args.chatId}>`,
              },
              {
                type: "mrkdwn",
                text: `*Justification*: ${args.justification}`,
              },
              {
                type: "mrkdwn",
                text: `*Categories*: \`${args.categories.join("`, `")}\``,
              },
            ],
          },
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
