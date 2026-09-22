import { prisma } from "@oakai/db";
import { googleDrive } from "@oakai/exports/src/gSuite/drive/client";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/node";
import type { NextRequest } from "next/server";
import { isTruthy } from "remeda";

const log = aiLogger("cron");

export const dynamic = "force-dynamic";

/** Bounds the scan size; Vercel separately enforces the 300s timeout. */
const MAX_PAGES = 10;

async function updateExpiredAtAndDelete(fileIds: string[]) {
  if (fileIds.length === 0) {
    log.info("No file IDs to update.");
    return { deletedCount: 0, orphanedCount: 0 };
  }

  const failedIds: string[] = [];
  const orphanedIds: string[] = [];
  let deletedCount = 0;

  for (const id of fileIds) {
    try {
      const record = await prisma.lessonExport.findFirst({
        where: { gdriveFileId: id },
      });

      if (!record) {
        // Leave files without a matching export untouched for investigation.
        orphanedIds.push(id);
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

      await googleDrive.files.delete({ fileId: id, supportsAllDrives: true });
      deletedCount += 1;
      log.info(`Successfully deleted file: ${id}`);
    } catch (error) {
      log.error(`Error processing file with gdriveFileId: ${id}`, error);
      failedIds.push(id);
    }
  }
  if (orphanedIds.length > 0) {
    log.warn(
      `Skipped ${orphanedIds.length} file(s) with no matching database record: ${orphanedIds.join(
        ", ",
      )}`,
    );
  }

  if (failedIds.length > 0) {
    const errorMessage = `Failed to process the following file IDs: ${failedIds.join(
      ", ",
    )}`;
    log.error(errorMessage);
    throw new Error(errorMessage);
  }

  return { deletedCount, orphanedCount: orphanedIds.length };
}

interface FetchExpiredExportsOptions {
  folderId: string;
  daysAgo: number;
}

async function fetchExpiredExports({
  folderId,
  daysAgo,
}: FetchExpiredExportsOptions) {
  const currentDate = new Date();
  const targetDate = new Date(
    currentDate.setDate(currentDate.getDate() - daysAgo),
  ).toISOString();
  const query = `modifiedTime < '${targetDate}' and '${folderId}' in parents`;
  const fileIds = new Set<string>();
  let pageToken: string | undefined;

  // Finish listing before deleting: mutating the result set while paging can
  // change which files Drive returns on subsequent pages.
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await googleDrive.files.list({
      q: query,
      fields: "nextPageToken, files(id, ownedByMe)",
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
    });
    const ids = (res.data.files ?? [])
      .filter((file) => file.ownedByMe === true)
      .map((file) => file.id)
      .filter(isTruthy);
    ids.forEach((id) => fileIds.add(id));
    pageToken = res.data.nextPageToken ?? undefined;
    if (!pageToken) {
      break;
    }
  }

  log.info(`Found ${fileIds.size} owned files older than ${daysAgo} days.`);
  return { fileIds: [...fileIds], hasMore: Boolean(pageToken) };
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

    const { fileIds, hasMore } = await fetchExpiredExports({
      folderId,
      daysAgo: 14,
    });
    const result = await updateExpiredAtAndDelete(fileIds);

    if (hasMore) {
      // Make a bounded, incomplete scan visible instead of reporting success.
      throw new Error(
        `Expired export cleanup incomplete: reached ${MAX_PAGES} pages.`,
      );
    }

    return Response.json(result);
  } catch (error) {
    Sentry.captureException(error);
    log.error("An error occurred during the cron job execution:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
