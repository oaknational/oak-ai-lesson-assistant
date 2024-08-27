import { posthogServerClient } from "@oakai/core/src/analytics/posthogServerClient";
import * as Sentry from "@sentry/node";

import { BOT_USER_ID } from "../constants";

export async function safelyReportAnalyticsEvent({
  eventName,
  payload,
  userId,
}: {
  eventName: string;
  payload: Record<string, unknown>;
  userId?: string;
}) {
  try {
    if (!process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
      return;
    }
    posthogServerClient.identify({
      distinctId: userId ?? BOT_USER_ID,
    });
    posthogServerClient.capture({
      distinctId: userId ?? BOT_USER_ID,
      event: eventName,
      properties: payload,
    });
    await posthogServerClient.shutdown();
  } catch (error) {
    Sentry.captureException(error);
  }
}
