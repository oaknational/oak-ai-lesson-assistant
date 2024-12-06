import {
  slackAiOpsNotificationChannelId,
  slackWebClient,
} from "@oakai/core/src/utils/slack";
import { googleDrive } from "@oakai/exports/src/gSuite/drive/client";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/node";
import type { NextRequest } from "next/server";

const log = aiLogger("cron");

const requiredEnvVars = ["CRON_SECRET", "SLACK_AI_OPS_NOTIFICATION_CHANNEL_ID"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is not set.`);
  }
});

async function fetchDriveUsage() {
  try {
    const res = await googleDrive.about.get({
      fields: "storageQuota, user(emailAddress)",
    });

    const storageQuota = res.data.storageQuota;
    const userEmail = res.data.user?.emailAddress;

    if (!storageQuota) {
      throw new Error("Unable to fetch storage quota information.");
    }

    const usage = {
      limit: parseInt(storageQuota.limit ?? "0", 10),
      usage: parseInt(storageQuota.usage ?? "0", 10),
      userEmail,
    };

    log.info(
      `Drive usage retrieved: ${usage.usage} bytes used of ${usage.limit} bytes total, ${userEmail}.`,
    );

    return usage;
  } catch (error) {
    log.error("Failed to fetch Google Drive usage details:", error);
    throw error;
  }
}

async function checkDriveUsageThreshold(thresholdPercentage: number = 80) {
  try {
    const usage = await fetchDriveUsage();

    if (usage.limit === 0) {
      throw new Error("Storage limit is reported as zero, which is invalid.");
    }

    const usagePercentage = (usage.usage / usage.limit) * 100;

    log.info(
      `Drive usage percentage: ${usagePercentage.toFixed(
        2,
      )}%. Threshold is set at ${thresholdPercentage}%.`,
    );

    if (usagePercentage > thresholdPercentage) {
      const errorMessage = `Drive usage is at ${usagePercentage.toFixed(
        2,
      )}% of the total limit, exceeding the threshold of ${thresholdPercentage}% : ${usage.userEmail}`;
      log.error(errorMessage);
      Sentry.captureMessage(errorMessage);
      await slackWebClient.chat.postMessage({
        channel: slackAiOpsNotificationChannelId,
        text: errorMessage,
      });
    }
  } catch (error) {
    log.error("Error during Drive usage check:", error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      log.error("Missing cron secret");
      return new Response("Missing cron secret", { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      log.error("Authorization failed. Invalid token.");
      return new Response("Unauthorized", { status: 401 });
    }

    log.info("Starting Google Drive usage check...");

    await checkDriveUsageThreshold(80);

    return new Response("Drive usage check completed successfully.", {
      status: 200,
    });
  } catch (error) {
    log.error(
      "An error occurred during the Drive usage check cron job:",
      error,
    );
    Sentry.captureException(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
