import { prisma } from "@oakai/db";
import { googleDrive } from "@oakai/exports/src/gSuite/drive/client";
import { aiLogger } from "@oakai/logger";
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

async function updateExpiredAt(fileIds: string[]) {
  if (fileIds.length === 0) {
    log.info("No file IDs to update.");
    return;
  }

  try {
    const result = await prisma.lessonExport.updateMany({
      where: {
        gdriveFileId: {
          in: fileIds,
        },
      },
      data: {
        expiredAt: new Date(),
      },
    });
    log.info(`Updated expiredAt for ${fileIds.length} files.`);

    if (result.count === fileIds.length) {
      log.info("All files updated successfully.");
    } else {
      throw new Error(
        `Expected to update ${fileIds.length} files, but only updated ${result.count}.`,
      );
    }
  } catch (error) {
    log.error("Error updating expiredAt field in the database:", error);
    throw error;
  }
}

async function deleteExpiredExports(fileIds: string[]) {
  try {
    for (const id of fileIds) {
      await googleDrive.files.delete({ fileId: id });
      log.info("Deleted:", id);
    }
  } catch (error) {
    log.error("Error deleting old files from folder:", error);
    throw error;
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
      res.data.files?.filter((file) => file.ownedByMe === true) || [];

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

    const files = await fetchExpiredExports({ folderId, daysAgo: 14 });

    if (!files || files.length === 0) {
      return new Response("No expired files found", { status: 404 });
    }

    const validFileIds = files.map((file) => file.id).filter(isTruthy);

    await updateExpiredAt(validFileIds);
    await deleteExpiredExports(validFileIds);
  } catch (error) {
    Sentry.captureException(error);
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
