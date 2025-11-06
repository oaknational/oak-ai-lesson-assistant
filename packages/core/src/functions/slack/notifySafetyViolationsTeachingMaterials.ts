import { inngest } from "../../inngest";
import {
  actionsBlock,
  createHeaderBlock,
  createModerationSectionBlock,
  createThreatSectionBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import { notifySafetyViolationsTeachingMaterialsSchema } from "./notifySafetyViolationsTeachingMaterials.schema";

export const notifySafetyViolationsTeachingMaterials = inngest.createFunction(
  {
    name: "Notify in slack when a user's input is flagged for moderation in teaching materials",
    id: "app-slack-notify-moderation-teaching-materials",
  },
  { event: "app/slack.notifySafetyViolationsTeachingMaterials" },
  async ({ event, step }) => {
    await step.run("Send message to slack", async () => {
      const args = notifySafetyViolationsTeachingMaterialsSchema.data.parse(
        event.data,
      );

      const headerText =
        args.violationType === "THREAT"
          ? "Threat detected - Teaching materials"
          : "Toxic user input detected - Teaching materials";

      const sectionBlock =
        args.violationType === "THREAT"
          ? createThreatSectionBlock({
              id: args.id,
              userInput: args.threatDetection?.userInput ?? "N/A",
              detectedThreats: args.threatDetection?.detectedThreats ?? [],
              requestId: args.threatDetection?.requestId,
              userAction: args.userAction,
              violationType: args.violationType,
            })
          : createModerationSectionBlock({
              id: args.id,
              justification: args.justification ?? "",
              categories: args.categories ?? [],
              userAction: args.userAction,
              violationType: args.violationType,
            });

      const response = await slackWebClient.chat.postMessage({
        channel: slackNotificationChannelId,
        text: "Toxic user input detected",
        blocks: [
          createHeaderBlock(headerText),
          userIdBlock(event.user.id),
          sectionBlock,
          actionsBlock({ userActionsProps: { userId: event.user.id } }),
        ],
      });

      return response;
    });
  },
);
