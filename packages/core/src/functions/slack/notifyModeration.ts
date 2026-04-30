import {
  actionsBlock,
  createHeaderBlock,
  createLabeledMarkdownField,
  createMarkdownField,
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
      createHeaderBlock(heading),
      userIdBlock(event.user.id),
      {
        type: "section",
        fields: [
          createMarkdownField(
            `*Chat*: <https://${getExternalFacingUrl()}/aila/${args.chatId}|aila/${args.chatId}>`,
            "moderation.chat",
          ),
          createLabeledMarkdownField(
            "*Justification*: ",
            args.justification,
            "moderation.justification",
          ),
          createMarkdownField(
            `*Categories*: \`${args.categories.join("`, `")}\``,
            "moderation.categories",
          ),
        ],
      },
      actionsBlock({
        userActionsProps: { userId: event.user.id },
        chatActionsProps: { chatId: args.chatId },
      }),
    ],
  });
}
