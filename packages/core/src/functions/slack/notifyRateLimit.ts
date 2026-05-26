import {
  actionsBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import type { NotifyRateLimitInput } from "./notifyRateLimit.schema";

export async function notifyRateLimit(event: NotifyRateLimitInput) {
  const args = event.data;

  await slackWebClient.chat.postMessage({
    channel: slackNotificationChannelId,
    text: "User rate limit exceeded",
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
}
