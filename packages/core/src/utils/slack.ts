import { aiLogger } from "@oakai/logger";

import type { ActionsBlock, SectionBlock } from "@slack/web-api";
import { WebClient } from "@slack/web-api";

import { getExternalFacingUrl } from "../functions/slack/getExternalFacingUrl";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "../threatDetection/types";
import { generateFriendlyId } from "./friendlyId";

const log = aiLogger("core");

export const slackTextLimits = {
  headerText: 150,
  sectionFieldText: 2000,
} as const;

const SLACK_TRUNCATION_SUFFIX = "... [truncated]";

function truncateSlackText(
  text: string,
  maxLength: number,
  fieldName: string,
): string {
  if (text.length <= maxLength) {
    return text;
  }

  const suffix =
    maxLength > SLACK_TRUNCATION_SUFFIX.length
      ? SLACK_TRUNCATION_SUFFIX
      : SLACK_TRUNCATION_SUFFIX.slice(0, maxLength);
  const truncatedText = `${text.slice(0, maxLength - suffix.length)}${suffix}`;

  log.info("Truncated Slack text", {
    fieldName,
    originalLength: text.length,
    truncatedLength: truncatedText.length,
    maxLength,
  });

  return truncatedText;
}

function truncateSlackFieldText(text: string, fieldName: string): string {
  return truncateSlackText(text, slackTextLimits.sectionFieldText, fieldName);
}

function truncateSlackLabeledField(
  label: string,
  value: string,
  fieldName: string,
): string {
  return `${label}${truncateSlackText(
    value,
    Math.max(0, slackTextLimits.sectionFieldText - label.length),
    fieldName,
  )}`;
}

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
      createMarkdownField(`*User*: \`${userId}\``, "user.id"),
      createMarkdownField(`(*_${friendlyId}_*)`, "user.friendlyId"),
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
      createMarkdownField(
        `*Chat*: <https://${externalUrl}/aila/${chatId}|aila/${chatId}>`,
        "chat.link",
      ),
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
          url: `https://${getExternalFacingUrl()}/admin/users/${userActionsProps.userId}`,
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
  detectedThreats: SlackThreatDetectionSummary["detectedThreats"];
  requestId?: string;
}): SlackThreatDetectionSummary {
  return {
    userInput: args.messages.map((message) => message.content).join("\n"),
    detectedThreats: args.detectedThreats,
    requestId: args.requestId,
  };
}

function getDetectedThreatsSummary(
  threatDetection: ThreatDetectionResult,
): SlackThreatDetectionSummary["detectedThreats"] {
  const detectedFindings = threatDetection.findings.filter(
    (finding) => finding.detected,
  );
  const detectedThreatSummaries = detectedFindings.map((finding) => ({
    detectorType: finding.category,
    detectorId: finding.providerCode,
  }));

  if (detectedThreatSummaries.length > 0) {
    return detectedThreatSummaries;
  }

  // Some fallback/synthetic threat results set `isThreat` without structured
  // findings. Keep a single generic entry so Slack still shows what was flagged.
  if (threatDetection.isThreat) {
    return [
      {
        detectorType: threatDetection.category ?? "other",
      },
    ];
  }

  return [];
}

export function formatThreatDetectionResultWithMessages(
  threatDetection: ThreatDetectionResult,
  messages: ThreatDetectionMessage[],
): SlackThreatDetectionSummary {
  return createSlackThreatDetectionSummary({
    messages,
    detectedThreats: getDetectedThreatsSummary(threatDetection),
    requestId: threatDetection.requestId,
  });
}

/**
 * Format threat detection data into a Slack section field-safe markdown string
 */
export function formatThreatFieldMarkdown(
  userInput: string,
  detectedThreats: Array<{ detectorType: string; detectorId?: string }>,
  requestId?: string,
): string {
  let detailsMarkdown = "";

  if (detectedThreats.length > 0) {
    detailsMarkdown += "*Detected Threats:*\n";
    for (const threat of detectedThreats) {
      detailsMarkdown += `• *Type:* \`${threat.detectorType}\`\n`;
      if (threat.detectorId) {
        detailsMarkdown += `  *Detector:* \`${threat.detectorId}\`\n`;
      }
    }
    detailsMarkdown += "\n";
  }

  if (requestId) {
    detailsMarkdown += `*Request ID:* \`${requestId}\``;
  }

  const prefix = "🚨 *Threat Detected*\n\n*User Input:*\n> ";
  const suffix = detailsMarkdown ? `\n\n${detailsMarkdown}` : "";
  const availableUserInputLength =
    slackTextLimits.sectionFieldText - prefix.length - suffix.length;
  const truncatedUserInput = truncateSlackText(
    userInput,
    Math.max(0, availableUserInputLength),
    "threat.userInput",
  );

  return truncateSlackFieldText(
    `${prefix}${truncatedUserInput}${suffix}`,
    "threat.summary",
  );
}

/**
 * Create a header block for Slack messages
 */
export function createHeaderBlock(text: string) {
  return {
    type: "header" as const,
    text: {
      type: "plain_text" as const,
      text: truncateSlackText(text, slackTextLimits.headerText, "header.text"),
    },
  };
}

/**
 * Create a simple markdown field block
 */
export function createMarkdownField(text: string, fieldName = "section.field") {
  return {
    type: "mrkdwn" as const,
    text: truncateSlackFieldText(text, fieldName),
  };
}

export function createLabeledMarkdownField(
  label: string,
  value: string,
  fieldName: string,
) {
  return {
    type: "mrkdwn" as const,
    text: truncateSlackLabeledField(label, value, fieldName),
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
      createMarkdownField(`*Id*: ${args.id}`, "threat.id"),
      {
        type: "mrkdwn" as const,
        text: formatThreatFieldMarkdown(
          args.userInput,
          args.detectedThreats,
          args.requestId,
        ),
      },
      createMarkdownField(
        `*User action*:  ${args.userAction}`,
        "threat.action",
      ),
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
      createMarkdownField(`*Id*: ${args.id}`, "moderation.id"),
      createLabeledMarkdownField(
        "*Justification*: ",
        args.justification,
        "moderation.justification",
      ),
      createMarkdownField(
        `*Categories*: \`${args.categories.join("`, `")}\``,
        "moderation.categories",
      ),
      createMarkdownField(
        `*User action*:  ${args.userAction}`,
        "moderation.action",
      ),
      createMarkdownField(
        `*Violation type*:  ${args.violationType}`,
        "moderation.violationType",
      ),
    ],
  };
}
