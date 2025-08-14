import { prisma } from "@oakai/db";

import * as Sentry from "@sentry/node";
import type { PassThrough } from "stream";

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

export function nodePassThroughToReadableStream(passThrough: PassThrough) {
  return new ReadableStream({
    start(controller) {
      passThrough.on("data", (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      passThrough.on("end", () => {
        controller.close();
      });
      passThrough.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      passThrough.destroy();
    },
  });
}
