import { downloadDriveFile } from "@oakai/exports";
import { aiLogger } from "@oakai/logger";

import archiver from "archiver";
import { PassThrough } from "stream";

export const ext = ["pdf", "docx", "pptx"] as const;

const log = aiLogger("additional-materials");

type Ext = (typeof ext)[number][];

export async function getDriveDocsZipStream({
  fileId,
  ext,
  documentTitle,
}: {
  fileId: string;
  ext: Ext;
  documentTitle: string;
}) {
  log.info("Zipping files", fileId, ext);
  const zipStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);
  for (const e of ext) {
    const res = await downloadDriveFile({ fileId, ext: e });
    if ("error" in res) {
      log.error(res.error);
      throw new Error("Error downloading file, not included in zip");
    }
    const { data } = res;

    const filename = `${documentTitle} - ${fileId.slice(0, 5)}.${e}`;

    // @ts-expect-error @todo fix this
    archive.append(data.stream, { name: filename });
  }

  await archive.finalize();
  return zipStream;
}
