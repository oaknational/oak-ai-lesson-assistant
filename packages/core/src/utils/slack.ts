import { ActionsBlock, SectionBlock, WebClient } from "@slack/web-api";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

if (!process.env.SLACK_NOTIFICATION_CHANNEL_ID) {
  throw new Error("Missing env var SLACK_NOTIFICATION_CHANNEL_ID");
}
export const slackNotificationChannelId =
  process.env.SLACK_NOTIFICATION_CHANNEL_ID;

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

export function actionsBlock({
  userActionsProps,
  moderationActionsProps,
}: {
  userActionsProps?: { userId: string };
  moderationActionsProps?: { moderationId: string };
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
      ]
    : [];

  const moderationActions: ActionsBlock["elements"] = moderationActionsProps
    ? [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Invalidate moderation",
          },
          url: `https://${process.env.VERCEL_URL}/api/admin/moderation/${moderationActionsProps.moderationId}/invalidate`,
        },
      ]
    : [];

  return {
    type: "actions",
    elements: [...userActions, ...moderationActions],
  };
}
