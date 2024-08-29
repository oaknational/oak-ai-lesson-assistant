import { auth } from "@clerk/nextjs/server";
import { LessonExportType, prisma } from "@oakai/db";
import { downloadDriveFile } from "@oakai/exports";
import * as Sentry from "@sentry/node";

import { withSentry } from "@/lib/sentry/withSentry";

// From: https://www.ericburel.tech/blog/nextjs-stream-files
async function* nodeStreamToIterator(stream: NodeJS.ReadableStream) {
  for await (const chunk of stream) {
    if (chunk instanceof Buffer) {
      yield new Uint8Array(chunk);
    }
  }
}
function iteratorToStream(iterator: AsyncGenerator<Uint8Array>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

function getReadableExportType(exportType: LessonExportType) {
  switch (exportType) {
    case "EXIT_QUIZ_DOC":
      return "Exit quiz";
    case "LESSON_PLAN_DOC":
      return "Lesson plan";
    case "STARTER_QUIZ_DOC":
      return "Starter quiz";
    case "WORKSHEET_SLIDES":
      return "Worksheet";
    case "LESSON_SLIDES_SLIDES":
      return "Lesson slides";
  }
}

async function saveDownloadEvent({
  exportId,
  downloadedBy,
  ext,
}: {
  exportId: string;
  downloadedBy: string;
  ext: string;
}) {
  try {
    await prisma.qdExportDownload.create({
      data: {
        qdExportId: exportId,
        downloadedBy,
        ext,
      },
    });
  } catch (error) {
    Sentry.captureException(error, {
      level: "warning",
      extra: { exportId, downloadedBy, ext },
    });
  }
}

async function getHandler(req: Request) {
  const { searchParams } = new URL(req.url);

  const fileId = searchParams.get("fileId");
  const ext = searchParams.get("ext");

  const { userId }: { userId: string | null } = auth();

  Sentry.addBreadcrumb({
    category: "download",
    message: "Download request",
    data: {
      fileId,
      ext,
      userId,
    },
  });

  if (!userId) {
    const error = new Error("Download attempt without userId");
    const authObject = auth();
    Sentry.captureException(error, {
      level: "warning",
      extra: { authObject },
    });
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  if (!fileId || !ext) {
    return new Response("Missing fileId or ext", {
      status: 400,
    });
  }
  if (ext !== "pdf" && ext !== "docx" && ext !== "pptx") {
    return new Response("Invalid ext", {
      status: 400,
    });
  }

  const qdExport = await prisma.qdExport.findFirst({
    where: {
      gdriveFileId: fileId,
      userId,
    },
    cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
  });

  if (!qdExport) {
    const error = new Error("Lesson export not found");
    Sentry.captureException(error, {
      level: "warning",
    });
    /**
     * Either the fileId is invalid or the user is trying to download a file that doesn't belong to them.
     */
    return new Response("Not found", {
      status: 404,
    });
  }

  saveDownloadEvent({
    exportId: qdExport.id,
    downloadedBy: userId,
    ext,
  });

  const res = await downloadDriveFile({
    fileId,
    ext,
  });

  if ("error" in res) {
    Sentry.captureException(res.error);
    return new Response(res.message, {
      status: 500,
    });
  }

  const { data } = res;

  const iterator = nodeStreamToIterator(data.stream);
  const stream = iteratorToStream(iterator);

  const shortId = qdExport.id.slice(-8);
  const filename = `${shortId} - ${getReadableExportType(qdExport.exportType)}`;

  return new Response(stream, {
    status: 200,
    headers: new Headers({
      "content-disposition": `attachment; filename=${filename}.${ext}`,
      "content-type": data.mimeType,
    }),
  });
}

export const GET = withSentry(getHandler);
