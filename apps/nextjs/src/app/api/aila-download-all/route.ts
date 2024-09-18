import { auth } from "@clerk/nextjs/server";
import { LessonExportType, prisma } from "@oakai/db";
import { downloadDriveFile } from "@oakai/exports";
import * as Sentry from "@sentry/node";
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
  const lessonTitle = searchParams.get("lessonTitle") ?? "";
  const { userId }: { userId: string | null } = auth();

  if (!userId) {
    const error = new Error("Download attempt without userId");
    Sentry.captureException(error, { level: "warning" });
    return new Response("Unauthorized", { status: 401 });
  }

  if (!fileIdsParam) {
    return new Response("Invalid or missing fileIds", { status: 400 });
  }

  const nonce = req.headers.get("x-middleware-csp-nonce");
  if (!nonce) {
    return new Response("Missing nonce", { status: 400 });
  }

  const prepareDownload = searchParams.get("prepareDownload");
  if (!prepareDownload) {
    const loadingHtml = `
<html>
  <body>
    <pre>
Loading...
| 
Please wait while we prepare your files for download. This can take up to 1 minute.

<script nonce="${nonce}">
  const spinnerChars = ['|', '/', '-', '\\\\'];
  let spinnerIndex = 0;
  
  setInterval(() => {
    document.querySelector('pre').textContent = 'Loading...\\n' + spinnerChars[spinnerIndex] + '\\nPlease wait while we prepare your files for download. This can take up to 1 minute.';
    spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
  }, 200);
  
  // Trigger the actual download by fetching the same URL but with the prepareDownload flag
  fetch(window.location.href + '&prepareDownload=true')
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = '${lessonTitle || "export"}.zip';
      link.click();
    })
    .catch(err => {
      document.body.innerHTML = '<h1>Something went wrong. Please try again later.</h1>';
    });
</script>
    </pre>
  </body>
</html>
`;

    return new Response(loadingHtml, {
      status: 200,
      headers: new Headers({
        "content-type": "text/html",
      }),
    });
  }

  let fileIdsAndFormats;
  try {
    fileIdsAndFormats = JSON.parse(decodeURIComponent(fileIdsParam));
  } catch (error) {
    Sentry.captureException(error, { level: "error" });
    return new Response("Invalid fileIds format", { status: 400 });
  }

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

        const shortId = lessonExport.id.slice(-8);
        const filename = `${lessonTitle} - ${shortId} - ${getReadableExportType(
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
    return new Response("No files found or processed", { status: 404 });
  }

  archive.finalize();

  const readableStream = nodePassThroughToReadableStream(zipStream);

  return new Response(readableStream, {
    status: 200,
    headers: new Headers({
      "content-disposition": `attachment; filename=aila: ${lessonTitle} all resources.zip`,
      "content-type": "application/zip",
    }),
  });
}

export const GET = withSentry(getHandler);
