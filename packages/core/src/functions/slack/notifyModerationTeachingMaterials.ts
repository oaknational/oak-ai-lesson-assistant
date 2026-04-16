import {
  actionsBlock,
  createHeaderBlock,
  createModerationSectionBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import type { NotifyModerationTeachingMaterialsInput } from "./notifyModerationTeachingMaterials.schema";

export async function notifyModerationTeachingMaterials(
  event: NotifyModerationTeachingMaterialsInput,
) {
  const args = event.data;

  await slackWebClient.chat.postMessage({
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
}
