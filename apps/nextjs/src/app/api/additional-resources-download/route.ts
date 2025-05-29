import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { transformDataForExport } from "@oakai/additional-materials/src/documents/additionalMaterials/dataHelpers/transformDataForExports";
import { exportAdditionalResourceDoc } from "@oakai/exports/src/exportAdditionalResourceDoc";
import { aiLogger } from "@oakai/logger";

import { auth, clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/node";
import type { NextApiResponse } from "next";

import { nodePassThroughToReadableStream } from "../aila-download/downloadHelpers";
import { getDriveDocsZipStream } from "./helpers";

const log = aiLogger("additional-materials");

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }
  const client = clerkClient();

  try {
    const body = await req.json();
    const { documentType, resource, lessonTitle } = body;
    const passedDocType = additionalMaterialTypeEnum.parse(documentType);
    const { userId }: { userId: string | null } = auth();

    if (!userId) {
      const error = new Error("Download attempt without userId");
      Sentry.captureException(error, { level: "warning" });
      return new Response("Unauthorized", { status: 401 });
    }
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
      log.error("Download attempt without userEmail", { userId });
      const error = new Error("Download attempt without userEmail");
      Sentry.captureException(error, { level: "warning" });
      return new Response("Unauthorized", { status: 401 });
    }

    const exportLink = await exportAdditionalResourceDoc({
      userEmail: userEmail,
      lessonTitle,
      onStateChange: (state) => {
        log.info(state);
        Sentry.addBreadcrumb({
          category: "exportAdditionalResourceDoc",
          message: "Export state change",
          data: state,
        });
      },
      documentType,
      data: resource,
      transformData: transformDataForExport(passedDocType)(),
    });

    if ("error" in exportLink) {
      const error = new Error("Failed to generate export link");
      Sentry.captureException(error, { extra: { exportLink } });
      return new Response("Failed to generate export link", { status: 500 });
    }

    const stream = await getDriveDocsZipStream({
      fileId: exportLink.data.fileId,
      fileIds: exportLink.data.fileIds,
      ext: ["pdf", "docx"],
      documentTitle: `${lessonTitle} - ${documentType}`,
    });

    if ("error" in stream) {
      const error = new Error("Failed to create ZIP stream from Drive");
      Sentry.captureException(error, { extra: { stream } });
      return new Response("Failed to create ZIP stream", { status: 500 });
    }

    const readableStream = nodePassThroughToReadableStream(stream);

    if (!readableStream) {
      const error = new Error("Failed to create readable stream");
      Sentry.captureException(error, { extra: { readableStream } });
      return new Response("Failed to create readable stream", { status: 500 });
    }

    return new Response(readableStream, {
      status: 200,
      headers: new Headers({
        "content-disposition": `attachment; filename=resources.zip`,
        "content-type": "application/zip",
      }),
    });
  } catch (error) {
    log.error("Unexpected error in export additional materials", { error });
    Sentry.captureException(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
