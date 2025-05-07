import { googleDrive } from "@oakai/exports/src/gSuite/drive/client";
import { aiLogger } from "@oakai/logger";

import type { drive_v3 } from "@googleapis/drive";
import * as Sentry from "@sentry/node";
import type { NextRequest } from "next/server";
import { isTruthy } from "remeda";

import { fetchExpiredExports } from "../helpers";

const log = aiLogger("cron");

const requiredEnvVars = [
  "CRON_SECRET",
  "GOOGLE_DRIVE_OUTPUT_FOLDER_ID_ADDITIONAL_MATERIALS",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is not set.`);
  }
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      log.error("Authorization failed. Invalid token.");
      return new Response("Unauthorized", { status: 401 });
    }
    const folderId =
      process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID_ADDITIONAL_MATERIALS;

    if (!cronSecret) {
      log.error("Missing cron secret");
      return new Response("Missing cron secret", { status: 500 });
    }
    if (!folderId) {
      log.error("No folder ID provided.");
      return new Response("No folder ID provided", { status: 500 });
    }

    let files: drive_v3.Schema$File[] | null;
    let hasMoreFiles = true;

    while (hasMoreFiles) {
      files = await fetchExpiredExports({ folderId, daysAgo: 14 });

      if (!files || files.length === 0) {
        log.info("No expired files found - Additional materials.");
        hasMoreFiles = false;
        break;
      }

      const validFileIds = files.map((file) => file.id).filter(isTruthy);

      if (validFileIds.length === 0) {
        log.info("No valid file IDs to process.");
        hasMoreFiles = false;
        break;
      }

      for (const id of validFileIds) {
        try {
          await googleDrive.files.delete({ fileId: id });
          log.info(`Successfully deleted file: ${id}`);
        } catch (deleteError) {
          log.warn(`Failed to delete file ${id}`, deleteError);
          Sentry.captureException(deleteError);
        }
      }
    }

    return new Response("All expired files processed successfully.", {
      status: 200,
    });
  } catch (error) {
    Sentry.captureException(error);
    log.error("An error occurred during the cron job execution:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
