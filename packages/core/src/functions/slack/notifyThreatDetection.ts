import { inngest } from "../../inngest";
import {
  actionsBlock,
  slackNotificationChannelId,
  slackWebClient,
  userIdBlock,
} from "../../utils/slack";
import { notifyThreatDetectionSchema } from "./notifyThreatDetection.schema";

export const notifyThreatDetection = inngest.createFunction(
  {
    name: "Notify in slack when a threat is detected on main Aila system",
    id: "app-slack-notify-threat-detection",
  },
  { event: "app/slack.notifyThreatDetection" },
  async ({ event, step }) => {
    await step.run("Send threat alert to slack", async () => {
      const args = notifyThreatDetectionSchema.data.parse(
        event.data,
      );

      const response = await slackWebClient.chat.postMessage({
        channel: slackNotificationChannelId,
        text: "🚨 THREAT DETECTED - Immediate action required",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🚨 THREAT DETECTED - Main Aila System",
            },
          },
          userIdBlock(event.user.id),
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Threat ID*: ${args.id}`,
              },
              {
                type: "mrkdwn",
                text: `*Threat Level*: ${args.threatLevel}`,
              },
              {
                type: "mrkdwn",
                text: `*Threat Category*: ${args.threatCategory}`,
              },
              {
                type: "mrkdwn",
                text: `*User Action*: ${args.userAction}`,
              },
              {
                type: "mrkdwn",
                text: `*Detection Time*: ${args.detectionTime}`,
              },
              {
                type: "mrkdwn",
                text: `*System Component*: ${args.systemComponent}`,
              },
            ],
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Threat Description*: ${args.threatDescription}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "🚨 *URGENT: This threat requires immediate review and may pose a security risk. Please escalate to appropriate authorities if necessary.*",
            },
          },
          actionsBlock({ userActionsProps: { userId: event.user.id } }),
        ],
      });

      return response;
    });
  },
);
