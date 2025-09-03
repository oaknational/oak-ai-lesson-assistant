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

      const isThreat = args.violationType === "THREAT";
      
      // Different text and formatting for threats vs regular moderation
      const fallbackText = isThreat 
        ? "🚨 THREAT DETECTED - Immediate action required" 
        : "⚠️ Content moderation flag - Review required";
      
      const headerText = isThreat
        ? "🚨 THREAT DETECTED - Teaching Materials"
        : "⚠️ Content Moderation Flag - Teaching Materials";

      const response = await slackWebClient.chat.postMessage({
        channel: slackNotificationChannelId,
        text: fallbackText,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: headerText,
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
          // Add threat-specific warning for threats
          ...(isThreat ? [{
            type: "section" as const,
            text: {
              type: "mrkdwn" as const,
              text: "🚨 *URGENT: This content requires immediate review and may pose a safety risk. Please escalate to appropriate authorities if necessary.*",
            },
          }] : []),
          actionsBlock({ userActionsProps: { userId: event.user.id } }),
        ],
      });

      return response;
    });
  },
);
