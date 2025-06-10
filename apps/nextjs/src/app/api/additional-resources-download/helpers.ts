import { downloadDriveFile } from "@oakai/exports";
import { aiLogger } from "@oakai/logger";

import archiver from "archiver";
import { PassThrough } from "stream";

export const ext = ["pdf", "docx", "pptx"] as const;

const log = aiLogger("additional-materials");

type Ext = (typeof ext)[number][];

export async function getDriveDocsZipStream({
  fileId,
  fileIds,
  ext,
  documentTitle,
}: {
  fileId: string;
  fileIds?: string[];
  ext: Ext;
  documentTitle: string;
}) {
  log.info("Zipping files", fileId, fileIds, ext);
  const zipStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);

  // Use fileIds array if provided, otherwise use single fileId
  const allFileIds = fileIds || [fileId];

  for (const currentFileId of allFileIds) {
    for (const e of ext) {
      const res = await downloadDriveFile({ fileId: currentFileId, ext: e });
      if ("error" in res) {
        log.error(res.error);
        log.warn(`Error downloading file ${currentFileId}.${e}, skipping`);
        continue;
      }
      const { data } = res;

      // Generate a meaningful filename based on the file's position in the array
      const fileType =
        allFileIds.length > 1 && allFileIds.indexOf(currentFileId) > 0
          ? "Answers"
          : "";
      const filename = `${documentTitle}${fileType ? ` - ${fileType}` : ""} - ${currentFileId.slice(0, 5)}.${e}`;

      // @ts-expect-error @todo fix this
      archive.append(data.stream, { name: filename });
    }
  }

  await archive.finalize();
  return zipStream;
}
