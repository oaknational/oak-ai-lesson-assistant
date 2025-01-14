import { auth } from "@clerk/nextjs/server";
import { prisma, type LessonExportType } from "@oakai/db";
import { downloadDriveFile } from "@oakai/exports";
import * as Sentry from "@sentry/node";
import { kv } from "@vercel/kv";
import * as archiver from "archiver";
import { PassThrough, type Readable } from "stream";

import { withSentry } from "@/lib/sentry/withSentry";

import { saveDownloadEvent } from "../aila-download/downloadHelpers";
import { sanitizeFilename } from "../sanitizeFilename";

type FileIdsAndFormats = {
  fileId: string;
  formats: ReadonlyArray<"pptx" | "docx" | "pdf">;
}[];

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

const handleFileDownloadError = (fileId: string, error: Error) => {
  Sentry.captureException(error, { level: "error", extra: { fileId } });
};

const processFileDownload = async (
  fileId: string,
  formats: readonly ("pptx" | "docx" | "pdf")[],
  lessonTitle: string,
  userId: string,
  archive: archiver.Archiver,
) => {
  const lessonExport = await prisma.lessonExport.findFirst({
    where: { gdriveFileId: fileId, userId, expiredAt: null },
  });

  if (!lessonExport) {
    const error = new Error(`Lesson export not found for fileId: ${fileId}`);
    handleFileDownloadError(fileId, error);
    return;
  }

  for (const ext of formats) {
    try {
      const res = await downloadDriveFile({ fileId, ext });

      if ("error" in res) {
        const err = new Error("Error downloading file, not included in zip", {
          cause: res.error,
        });
        handleFileDownloadError(fileId, err);
        continue;
      }

      const { data } = res;
      const filename = `${lessonTitle} - ${lessonExport.id.slice(0, 5)} - ${getReadableExportType(lessonExport.exportType)}.${ext}`;

      archive.append(data.stream as Readable, { name: filename });

      await saveDownloadEvent({
        lessonExportId: lessonExport.id,
        downloadedBy: userId,
        ext,
      });
    } catch (error) {
      handleFileDownloadError(fileId, error as Error);
    }
  }
};

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
    Sentry.addBreadcrumb({
      message: "Missing fileIds",
      data: {
        lessonTitle,
        fileIdsParam,
      },
    });
    return new Response("Invalid or missing fileIds", { status: 400 });
  }
  const taskId = `download-all-${fileIdsParam.toString()}`;

  let fileIdsAndFormats: FileIdsAndFormats;
  try {
    fileIdsAndFormats = JSON.parse(decodeURIComponent(fileIdsParam));
  } catch (error) {
    Sentry.captureException(error, { level: "error" });
    return new Response("Invalid fileIds format", { status: 400 });
  }

  await kv.set(taskId, "loading");

  const zipStream = new PassThrough();
  const archive = archiver.create("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);

  const downloadPromises = fileIdsAndFormats.map(({ fileId, formats }) =>
    processFileDownload(fileId, formats, lessonTitle, userId, archive),
  );

  try {
    await Promise.all(downloadPromises);
    await archive.finalize();
    await kv.set(taskId, "complete");
  } catch (error) {
    Sentry.captureException(error, { level: "error" });
    await kv.set(taskId, "failed");
    return new Response("Error processing files", { status: 500 });
  }
  const readableStream = nodePassThroughToReadableStream(zipStream);

  const sanitizedLessonTitle = sanitizeFilename(lessonTitle);

  return new Response(readableStream, {
    status: 200,
    headers: new Headers({
      "content-disposition": `attachment; filename=aila: ${sanitizedLessonTitle} all resources.zip`,
      "content-type": "application/zip",
    }),
  });
}

export const GET = withSentry(getHandler);
