import { transformDataForExport } from "@oakai/additional-materials/src/documents/additionalMaterials/dataHelpers/transformDataForExports";
import { exportAdditionalResourceDoc } from "@oakai/exports/src/exportAdditionalResourceDoc";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/node";
import type { NextApiRequest, NextApiResponse } from "next";

import { withSentry } from "@/lib/sentry/withSentry";

import { zipDownloadedDriveFiles } from "./helpers";

const log = aiLogger("additional-materials");
// export async function getHandler(req: NextApiRequest, res: NextApiResponse) {
//   //   if (req.method !== "POST") {
//   //     res.status(405).end("Method Not Allowed");
//   //     return;
//   //   }
//   const { documentType, resource } = req.body; // Expect { files: [{ name, content }] }

//   if (!documentType) {
//     res.status(400).end("Missing documentType");
//     return;
//   }

//   log.info(req.body, "BODYYYYYYYYYYYYY");
//   const exportLink = await exportAdditionalResourceDoc({
//     userEmail: "email",
//     onStateChange: (state) => {
//       log.info(state);
//       Sentry.addBreadcrumb({
//         category: "exportAdditionalResourceDoc",
//         message: "Export state change",
//         data: state,
//       });
//     },
//     documentType: documentType,
//     data: resource,
//     transformData: transformDataForExport("additional-glossary")(),
//   });
//   if ("error" in exportLink) {
//     res.status(500).end("Failed to generate export link");
//     return;
//   }
//   const stream = await zipDownloadedDriveFiles(
//     String(exportLink.data.fileId),
//     ["pdf", "docx", "pptx"],
//     String(documentType),
//   );
//   res.setHeader("Content-Type", "application/zip");
//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename="${documentType}.zip"`,
//   );
//   stream.pipe(res);
// }
// export const GET = getHandler;

export async function POST(req: Request, res: NextApiResponse) {
  // handle the POST request here
  //   if (req.method !== "POST") {
  //     res.status(405).end("Method Not Allowed");
  //     return;
  //   }
  const body = await req.json();
  const { documentType, resource } = body; // Expect { files: [{ name, content }] }

  const exportLink = await exportAdditionalResourceDoc({
    userEmail: "email",
    onStateChange: (state) => {
      log.info(state);
      Sentry.addBreadcrumb({
        category: "exportAdditionalResourceDoc",
        message: "Export state change",
        data: state,
      });
    },
    documentType: documentType,
    data: resource,
    transformData: transformDataForExport(documentType)(),
  });
  if ("error" in exportLink) {
    res.status(500).end("Failed to generate export link");
    return;
  }
  const stream = await zipDownloadedDriveFiles(
    String(exportLink.data.fileId),
    ["pdf", "docx", "pptx"],
    String(documentType),
  );
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${documentType}.zip"`,
  );
  stream.pipe(res);

  return new Response("Success", { status: 200 });
}
