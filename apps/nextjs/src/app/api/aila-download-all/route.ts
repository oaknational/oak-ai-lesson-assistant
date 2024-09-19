import { auth } from "@clerk/nextjs/server";
import { LessonExportType, prisma } from "@oakai/db";
import { downloadDriveFile } from "@oakai/exports";
import * as Sentry from "@sentry/node";
import { kv } from "@vercel/kv";
import archiver from "archiver";
import { PassThrough } from "stream";

import { withSentry } from "@/lib/sentry/withSentry";

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
    case "ADDITIONAL_MATERIALS_DOCS":
      return "Additional materials";
  }
}

async function saveDownloadEvent({
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

function nodePassThroughToReadableStream(passThrough: PassThrough) {
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

async function getHandler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const fileIdsParam = searchParams.get("fileIds");
  const lessonTitle = searchParams.get("lessonTitle");
  if (!lessonTitle) {
    return new Response("Invalid or missing lessonTitle", { status: 400 });
  }
  const { userId } = auth();

  if (!userId) {
    const error = new Error("Download attempt without userId");
    Sentry.captureException(error, { level: "warning" });
    return new Response("Unauthorized", { status: 401 });
  }

  if (!fileIdsParam) {
    return new Response("Invalid or missing fileIds", { status: 400 });
  }
  const taskId = `download-all-${fileIdsParam.toString()}`;

  const cookies = req.headers.get("cookie");
  const nonce = cookies?.match(/csp-nonce=([^;]+)/)?.[1];
  if (!nonce) {
    return new Response("Missing nonce", { status: 400 });
  }

  let fileIdsAndFormats;
  try {
    fileIdsAndFormats = JSON.parse(decodeURIComponent(fileIdsParam));
  } catch (error) {
    Sentry.captureException(error, { level: "error" });
    return new Response("Invalid fileIds format", { status: 400 });
  }

  await kv.set(taskId, "loading");

  const zipStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);

  let filesProcessed = 0;

  for (const { fileId, formats } of fileIdsAndFormats) {
    if (!fileId || !Array.isArray(formats)) continue;

    const lessonExport = await prisma.lessonExport.findFirst({
      where: { gdriveFileId: fileId, userId },
    });

    if (!lessonExport) {
      const error = new Error(`Lesson export not found for fileId: ${fileId}`);
      Sentry.captureException(error, { level: "warning" });
      continue;
    }

    for (const ext of formats) {
      try {
        const res = await downloadDriveFile({ fileId, ext });

        if ("error" in res) {
          Sentry.captureException(res.error);
          continue;
        }

        const { data } = res;

        const filename = `${lessonTitle} - ${lessonExport.id} - ${getReadableExportType(
          lessonExport.exportType,
        )}.${ext}`;

        archive.append(data.stream, { name: filename });

        await saveDownloadEvent({
          lessonExportId: lessonExport.id,
          downloadedBy: userId,
          ext,
        });

        filesProcessed++;
      } catch (error) {
        Sentry.captureException(error, { level: "error" });
      }
    }
  }

  if (filesProcessed === 0) {
    await kv.set(taskId, "failed");
    return new Response("No files found or processed", { status: 404 });
  }

  archive.finalize();

  const readableStream = nodePassThroughToReadableStream(zipStream);

  await kv.set(taskId, "complete");

  return new Response(readableStream, {
    status: 200,
    headers: new Headers({
      "content-disposition": `attachment; filename=aila: ${lessonTitle} all resources.zip`,
      "content-type": "application/zip",
    }),
  });
}

export const GET = withSentry(getHandler);
