import { inngest } from "../../client";
import {
  slackNotificationChannelId,
  slackWebClient,
  actionsBlock,
  userIdBlock,
} from "../../utils/slack";
import { notifyRateLimitSchema } from "./notifyRateLimit.schema";

// Example event data:
// {
//   "userId": "user_abc",
//   "limit": 100,
//   "reset": 1691187200000
// }

export const notifyRateLimit = inngest.createFunction(
  {
    name: "Notify in slack when a user exceeds their rate limit",
    id: "app-slack-notify-rate-limit",
  },
  { event: "app/slack.notifyRateLimit" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
      const args = notifyRateLimitSchema.data.parse(event.data);

      const response = await slackWebClient.chat.postMessage({
        channel: slackNotificationChannelId,
        text: `User rate limit exceeded`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "User rate limit exceeded",
            },
          },
          userIdBlock(event.user.id),
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Resets at*: ${args.reset.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Europe/London",
                })}`,
              },
              {
                type: "mrkdwn",
                text: `*Limit*: ${args.limit}`,
              },
            ],
          },
          actionsBlock({
            userActionsProps: { userId: event.user.id },
          }),
        ],
      });

      return response;
    });
  },
);
