import { prisma } from "@oakai/db";
import * as Sentry from "@sentry/node";

export async function saveDownloadEvent({
  lessonExportId,
  downloadedBy,
  ext,
}: {
  lessonExportId: string;
  downloadedBy: string;
  ext: string;
}) {
  try {
    await prisma.lessonExportDownload.create({
      data: {
        lessonExportId,
        downloadedBy,
        ext,
      },
    });
  } catch (error) {
    Sentry.captureException(error, {
      level: "warning",
      extra: { lessonExportId, downloadedBy, ext },
    });
  }
}
