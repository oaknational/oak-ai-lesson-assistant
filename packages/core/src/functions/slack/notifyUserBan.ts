import {
  actionsBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import type { NotifyUserBanInput } from "./notifyUserBan.schema";

export async function notifyUserBan(event: NotifyUserBanInput) {
  await slackWebClient.chat.postMessage({
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
}
