import { inngest } from "../../inngest";
import {
  actionsBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";

// Example event data:
// {
//   "userId": "user_abc"
// }

export const notifyUserBan = inngest.createFunction(
  {
    name: "Notify in slack when a user is banned",
    id: "app-slack-notify-user-ban",
  },
  { event: "app/slack.notifyUserBan" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
      const response = await slackWebClient.chat.postMessage({
        channel: slackNotificationChannelId,
        text: "User banned",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "User banned",
            },
          },
          userIdBlock(event.user.id),
          actionsBlock({
            userActionsProps: { userId: event.user.id },
          }),
        ],
      });

      return response;
    });
  },
);
