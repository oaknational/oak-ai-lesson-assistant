import { prisma } from "@oakai/db";
import { googleDrive } from "@oakai/exports/src/gSuite/drive/client";
import { aiLogger } from "@oakai/logger";

import type { drive_v3 } from "@googleapis/drive";
import * as Sentry from "@sentry/node";
import type { NextRequest } from "next/server";
import { isTruthy } from "remeda";

const log = aiLogger("cron");

const requiredEnvVars = ["CRON_SECRET", "GOOGLE_DRIVE_OUTPUT_FOLDER_ID"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is not set.`);
  }
});

async function updateExpiredAtAndDelete(fileIds: string[]) {
  if (fileIds.length === 0) {
    log.info("No file IDs to update.");
    return;
  }

  const failedIds: string[] = [];

  for (const id of fileIds) {
    try {
      const record = await prisma.lessonExport.findFirst({
        where: { gdriveFileId: id },
      });

      if (!record) {
        log.warn(`No database record found for gdriveFileId: ${id}`);
        failedIds.push(id);
        continue;
      }

      const result = await prisma.lessonExport.update({
        where: { id: record.id, gdriveFileId: id },
        data: { expiredAt: new Date() },
      });

      if (!result) {
        log.warn(`Failed to update expiredAt for gdriveFileId: ${id}`);
        failedIds.push(id);
        continue;
      }

      log.info(`Successfully updated expiredAt for file: ${id}`);

      await googleDrive.files.delete({ fileId: id });
      log.info(`Successfully deleted file: ${id}`);
    } catch (error) {
      log.error(`Error processing file with gdriveFileId: ${id}`, error);
      failedIds.push(id);
    }
  }
  if (failedIds.length > 0) {
    const errorMessage = `Failed to process the following file IDs: ${failedIds.join(
      ", ",
    )}`;
    log.error(errorMessage);
    throw new Error(errorMessage);
  }
}

interface FetchExpiredExportsOptions {
  folderId: string;
  daysAgo: number;
}

async function fetchExpiredExports({
  folderId,
  daysAgo,
}: FetchExpiredExportsOptions) {
  try {
    const currentDate = new Date();
    const targetDate = new Date(
      currentDate.setDate(currentDate.getDate() - daysAgo),
    ).toISOString();

    const query = `modifiedTime < '${targetDate}' and '${folderId}' in parents`;

    const res = await googleDrive.files.list({
      q: query,
      fields: "files(id, name, modifiedTime, ownedByMe )",
      pageSize: 1000,
    });

    const files =
      res.data.files?.filter((file) => file.ownedByMe === true) ?? [];

    if (files.length === 0) {
      log.info(
        "No files found that are older than one month in the specified folder.",
      );
      return null;
    }

    log.info(`Found ${files.length} files older than one month in folder:`);
    return files;
  } catch (error) {
    log.error("Error fetching old files from folder:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    const cronSecret = process.env.CRON_SECRET;
    const folderId = process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID;

    if (!cronSecret) {
      log.error("Missing cron secret");
      return new Response("Missing cron secret", { status: 500 });
    }
    if (!folderId) {
      log.error("No folder ID provided.");
      return new Response("No folder ID provided", { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      log.error("Authorization failed. Invalid token.");
      return new Response("Unauthorized", { status: 401 });
    }

    let files: drive_v3.Schema$File[] | null;
    let hasMoreFiles = true;

    while (hasMoreFiles) {
      files = await fetchExpiredExports({ folderId, daysAgo: 14 });

      if (!files || files.length === 0) {
        log.info("No expired files found.");
        hasMoreFiles = false;
        break;
      }

      const validFileIds = files.map((file) => file.id).filter(isTruthy);

      if (validFileIds.length === 0) {
        log.info("No valid file IDs to process.");
        hasMoreFiles = false;
        break;
      }

      await updateExpiredAtAndDelete(validFileIds);
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
