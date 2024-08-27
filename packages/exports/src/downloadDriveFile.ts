import { googleDrive } from "./gSuite/drive/client";
import { getExportFileStream } from "./gSuite/drive/getExportFileStream";
import { Result } from "./types";

type OutputData = {
  stream: NodeJS.ReadableStream;
  mimeType: string;
};
export const downloadDriveFile = async ({
  fileId,
  ext,
}: {
  fileId: string;
  ext: "pdf" | "docx" | "pptx";
}): Promise<Result<OutputData>> => {
  try {
    const res = await getExportFileStream({
      drive: googleDrive,
      fileId,
      ext,
    });

    if ("error" in res) {
      return res;
    }
    const { data } = res;

    return { data };
  } catch (error) {
    return { error, message: "Failed to export lesson plan" };
  }
};
