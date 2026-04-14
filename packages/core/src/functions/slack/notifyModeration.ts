import {
  actionsBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import { getExternalFacingUrl } from "./getExternalFacingUrl";
import type { NotifyModerationInput } from "./notifyModeration.schema";

export async function notifyModeration(event: NotifyModerationInput) {
  const args = event.data;

  const heading =
    args.safetyLevel === "highly-sensitive"
      ? "Highly sensitive content detected"
      : "Toxic user input detected";

  await slackWebClient.chat.postMessage({
    channel: slackNotificationChannelId,
    text: heading,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: heading,
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
}
