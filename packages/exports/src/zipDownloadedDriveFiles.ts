import archiver from "archiver";
import { downloadDriveFile } from "downloadDriveFile";
import { PassThrough } from "stream";

export const ext = ["pdf", "docx", "pptx"] as const;

type Ext = typeof ext;

export const zipDownloadedDriveFiles = async (
  fileId: string,
  ext: Ext,
  documentTitle: string,
) => {
  const zipStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);
  for (const e of ext) {
    const res = await downloadDriveFile({ fileId, ext: e });
    if ("error" in res) {
      throw new Error("Error downloading file, not included in zip");
    }
    const { data } = res;

    const filename = `${documentTitle} - ${fileId.slice(0, 5)}.${e}`;

    // @ts-expect-error @todo fix this
    archive.append(data.stream, { name: filename });
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  archive.finalize();
  return zipStream;
};
