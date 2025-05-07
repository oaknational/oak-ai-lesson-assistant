import { prisma } from "@oakai/db";
import { googleDrive } from "@oakai/exports/src/gSuite/drive/client";
import { aiLogger } from "@oakai/logger";

import type { drive_v3 } from "@googleapis/drive";

const log = aiLogger("cron");

export async function updateExpiredAtAndDelete(fileIds: string[]) {
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

export interface FetchExpiredExportsOptions {
  folderId: string;
  daysAgo: number;
}

export async function fetchExpiredExports({
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
