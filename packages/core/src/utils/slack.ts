import type { ActionsBlock, SectionBlock } from "@slack/web-api";
import { WebClient } from "@slack/web-api";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";

import { getExternalFacingUrl } from "../functions/slack/getExternalFacingUrl";
import type { LakeraGuardResponse } from "../threatDetection/lakera";
import type { Message } from "../threatDetection/lakera/schema";

if (
  !process.env.SLACK_NOTIFICATION_CHANNEL_ID ||
  !process.env.SLACK_AI_OPS_NOTIFICATION_CHANNEL_ID
) {
  throw new Error("Missing env var SLACK_NOTIFICATION_CHANNEL_ID");
}
export const slackNotificationChannelId =
  process.env.SLACK_NOTIFICATION_CHANNEL_ID;

export const slackAiOpsNotificationChannelId =
  process.env.SLACK_AI_OPS_NOTIFICATION_CHANNEL_ID;

export const slackWebClient = new WebClient(
  process.env.SLACK_BOT_USER_OAUTH_TOKEN,
);

const posthogProject = process.env.NEXT_PUBLIC_POSTHOG_PROJECT;
if (!posthogProject) {
  throw new Error("Missing env var NEXT_PUBLIC_POSTHOG_PROJECT");
}

const clerkInstanceId = process.env.NEXT_PUBLIC_CLERK_INSTANCE;
if (!clerkInstanceId) {
  throw new Error("Missing env var NEXT_PUBLIC_CLERK_INSTANCE");
}
const clerkAppId = process.env.NEXT_PUBLIC_CLERK_APP_ID;
if (!clerkAppId) {
  throw new Error("Missing env var NEXT_PUBLIC_CLERK_APP_ID");
}

export function userIdBlock(userId: string): SectionBlock {
  const friendlyId = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    seed: userId,
  });

  return {
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*User*: \`${userId}\``,
      },
      {
        type: "mrkdwn",
        text: `(*_${friendlyId}_*)`,
      },
    ],
  };
}

/**
 * Create a section block with a link to an Aila chat
 */
export function chatLinkBlock(chatId: string): SectionBlock {
  const externalUrl = getExternalFacingUrl();
  return {
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Chat*: <https://${externalUrl}/aila/${chatId}|aila/${chatId}>`,
      },
    ],
  };
}

/**
 * Generate a URL to the Lakera dashboard with a time range around the given timestamp
 * Creates a ±10 minute window around the detection time
 *
 * @param timestamp - Optional timestamp (defaults to now)
 * @returns URL to Lakera dashboard filtered to the time range
 */
export function getLakeraDashboardUrl(timestamp?: Date): string {
  const detectionTime = timestamp ?? new Date();
  const startTime = new Date(detectionTime.getTime() - 10 * 60 * 1000); // -10 minutes
  const endTime = new Date(detectionTime.getTime() + 10 * 60 * 1000); // +10 minutes

  const params = new URLSearchParams({
    page: "1",
    pageSize: "100",
    sortBy: "Timestamp",
    sortDirection: "DESC",
    timezone: "UTC",
    start: startTime.toISOString(),
    end: endTime.toISOString(),
    period: "unset",
  });

  return `https://platform.lakera.ai/dashboard/requests/detections?${params.toString()}`;
}

export function actionsBlock({
  userActionsProps,
  chatActionsProps,
  lakeraTimestamp,
}: {
  userActionsProps?: { userId: string };
  chatActionsProps?: { chatId: string };
  lakeraTimestamp?: Date;
}): ActionsBlock {
  const userActions: ActionsBlock["elements"] = userActionsProps
    ? [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Posthog user",
          },
          url: `https://eu.posthog.com/project/${posthogProject}/person/${userActionsProps.userId}`,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Clerk user",
          },
          url: `https://dashboard.clerk.com/apps/${clerkAppId}/instances/${clerkInstanceId}/users/${userActionsProps.userId}`,
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Aila admin user",
          },
          url: `https://labs.thenational.academy/admin/users/${userActionsProps.userId}`,
        },
      ]
    : [];

  const chatActions: ActionsBlock["elements"] = chatActionsProps
    ? [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Admin chat",
          },
          url: `https://${getExternalFacingUrl()}/admin/aila/${chatActionsProps.chatId}`,
        },
      ]
    : [];

  const lakeraActions: ActionsBlock["elements"] = lakeraTimestamp
    ? [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Lakera console",
          },
          url: getLakeraDashboardUrl(lakeraTimestamp),
        },
      ]
    : [];

  return {
    type: "actions",
    elements: [...userActions, ...chatActions, ...lakeraActions],
  };
}

/**
 * Formatted threat detection data for Slack notifications
 */
interface FormatThreatDetectionWithMessages {
  flagged: boolean;
  userInput: string;
  detectedThreats: Array<{
    detectorType: string;
    detectorId: string;
  }>;
  requestId?: string;
}

/**
 * Format Lakera threat detection result for Slack notification
 *
 * Extracts only the useful information:
 * - User's input that triggered the threat
 * - List of detected threats (filtered to only those with detected: true)
 * - Request UUID for traceability

 *
 * @param lakeraResult - The Lakera Guard API response
 * @param messages - The messages that were checked for threats
 * @returns Formatted threat detection data for Slack
 */
export function formatThreatDetectionWithMessages(
  lakeraResult: LakeraGuardResponse,
  messages: Message[],
): FormatThreatDetectionWithMessages {
  // Extract user input from messages (without role prefix for cleaner display)
  const userInput = messages.map((msg) => msg.content).join("\n");

  // Filter to only detected threats and extract relevant info
  const detectedThreats =
    lakeraResult.breakdown
      ?.filter((item) => item.detected)
      .map((item) => ({
        detectorType: item.detector_type,
        detectorId: item.detector_id,
      })) ?? [];

  return {
    flagged: lakeraResult.flagged,
    userInput,
    detectedThreats,
    requestId: lakeraResult.metadata?.request_uuid,
  };
}

/**
 * Format threat detection data as markdown for Slack
 */
export function formatThreatAsMarkdown(
  userInput: string,
  detectedThreats: Array<{ detectorType: string; detectorId: string }>,
  requestId?: string,
): string {
  let markdown = "🚨 *Threat Detected*\n\n";

  // User input section
  markdown += "*User Input:*\n";
  markdown += `> ${userInput}\n\n`;

  // Detected threats section
  if (detectedThreats.length > 0) {
    markdown += "*Detected Threats:*\n";
    detectedThreats.forEach((threat) => {
      markdown += `• *Type:* \`${threat.detectorType}\`\n`;
      markdown += `  *Detector:* \`${threat.detectorId}\`\n`;
    });
    markdown += "\n";
  }

  // Request ID for traceability
  if (requestId) {
    markdown += `*Request ID:* \`${requestId}\``;
  }

  return markdown;
}

/**
 * Create a header block for Slack messages
 */
export function createHeaderBlock(text: string) {
  return {
    type: "header" as const,
    text: {
      type: "plain_text" as const,
      text,
    },
  };
}

/**
 * Create a simple markdown field block
 */
export function createMarkdownField(text: string) {
  return {
    type: "mrkdwn" as const,
    text,
  };
}

/**
 * Create a section block for threat detection violations in teaching materials
 */
export function createThreatSectionBlock(args: {
  id: string;
  userInput: string;
  detectedThreats: Array<{ detectorType: string; detectorId: string }>;
  requestId?: string;
  userAction: string;
}): SectionBlock {
  return {
    type: "section",
    fields: [
      createMarkdownField(`*Id*: ${args.id}`),
      createMarkdownField(
        formatThreatAsMarkdown(
          args.userInput,
          args.detectedThreats,
          args.requestId,
        ),
      ),
      createMarkdownField(`*User action*:  ${args.userAction}`),
    ],
  };
}

/**
 * Create a section block for moderation violations in teaching materials
 */
export function createModerationSectionBlock(args: {
  id: string;
  justification: string;
  categories: string[];
  userAction: string;
  violationType: string;
}): SectionBlock {
  return {
    type: "section",
    fields: [
      createMarkdownField(`*Id*: ${args.id}`),
      createMarkdownField(`*Justification*: ${args.justification}`),
      createMarkdownField(`*Categories*: \`${args.categories.join("`, `")}\``),
      createMarkdownField(`*User action*:  ${args.userAction}`),
      createMarkdownField(`*Violation type*:  ${args.violationType}`),
    ],
  };
}
