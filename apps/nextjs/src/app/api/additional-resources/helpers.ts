import { downloadDriveFile } from "@oakai/exports";
import { aiLogger } from "@oakai/logger";

import archiver from "archiver";
import { PassThrough } from "stream";

export const ext = ["pdf", "docx", "pptx"] as const;

const log = aiLogger("additional-materials");

type Ext = typeof ext;

export async function zipDownloadedDriveFiles(
  fileId: string,
  ext: Ext,
  documentTitle: string,
) {
  const zipStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);
  for (const e of ext) {
    const res = await downloadDriveFile({ fileId, ext: e });
    if ("error" in res) {
      // throw new Error("Error downloading file, not included in zip");
      log.info(res.error);
    }
    const { data } = res;

    const filename = `${documentTitle} - ${fileId.slice(0, 5)}.${e}`;

    // @ts-expect-error @todo fix this
    archive.append(data.stream, { name: filename });
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  archive.finalize();
  return archive;
}
