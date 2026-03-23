import type { ActionsBlock, SectionBlock } from "@slack/web-api";
import { WebClient } from "@slack/web-api";

import { getExternalFacingUrl } from "../functions/slack/getExternalFacingUrl";
import type {
  ThreatDetectionResult,
  ThreatDetectionMessage,
} from "../threatDetection/types";
import { generateFriendlyId } from "./friendlyId";

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
  const friendlyId = generateFriendlyId(userId);

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

function createLakeraConsoleAction(timestamp?: Date): ActionsBlock["elements"] {
  if (!timestamp) {
    return [];
  }

  return [
    {
      type: "button",
      text: {
        type: "plain_text",
        text: "Lakera console",
      },
      url: getLakeraDashboardUrl(timestamp),
    },
  ];
}

export function actionsBlock({
  userActionsProps,
  chatActionsProps,
  lakeraConsoleTimestamp,
}: {
  userActionsProps?: { userId: string };
  chatActionsProps?: { chatId: string };
  lakeraConsoleTimestamp?: Date;
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

  return {
    type: "actions",
    elements: [
      ...userActions,
      ...chatActions,
      ...createLakeraConsoleAction(lakeraConsoleTimestamp),
    ],
  };
}

/**
 * Formatted threat detection data for Slack notifications
 */
export interface SlackThreatDetectionSummary {
  flagged: boolean;
  userInput: string;
  detectedThreats: Array<{
    detectorType: string;
    detectorId?: string;
  }>;
  requestId?: string;
}

/**
 * Convert checked messages and detected threats into the compact shape
 * used by Slack threat-notification blocks.
 */
function createSlackThreatDetectionSummary(args: {
  messages: Array<{ content: string }>;
  flagged: boolean;
  detectedThreats: SlackThreatDetectionSummary["detectedThreats"];
  requestId?: string;
}): SlackThreatDetectionSummary {
  return {
    flagged: args.flagged,
    userInput: args.messages.map((message) => message.content).join("\n"),
    detectedThreats: args.detectedThreats,
    requestId: args.requestId,
  };
}

export function formatThreatDetectionResultWithMessages(
  threatDetection: ThreatDetectionResult,
  messages: ThreatDetectionMessage[],
): SlackThreatDetectionSummary {
  return createSlackThreatDetectionSummary({
    messages,
    flagged: threatDetection.isThreat,
    detectedThreats:
      threatDetection.findings.length > 0
        ? threatDetection.findings
            .filter((finding) => finding.detected)
            .map((finding) => ({
              detectorType: finding.category,
              detectorId: finding.providerCode,
            }))
        : threatDetection.isThreat
          ? [
              {
                detectorType: threatDetection.category ?? "other",
              },
            ]
          : [],
    requestId: threatDetection.requestId,
  });
}

/**
 * Format threat detection data as markdown for Slack
 */
export function formatThreatAsMarkdown(
  userInput: string,
  detectedThreats: Array<{ detectorType: string; detectorId?: string }>,
  requestId?: string,
): string {
  let markdown = "🚨 *Threat Detected*\n\n";

  // User input section
  markdown += "*User Input:*\n";
  markdown += `> ${userInput}\n\n`;

  // Detected threats section
  if (detectedThreats.length > 0) {
    markdown += "*Detected Threats:*\n";
    for (const threat of detectedThreats) {
      markdown += `• *Type:* \`${threat.detectorType}\`\n`;
      if (threat.detectorId) {
        markdown += `  *Detector:* \`${threat.detectorId}\`\n`;
      }
    }
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
  detectedThreats: Array<{ detectorType: string; detectorId?: string }>;
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
