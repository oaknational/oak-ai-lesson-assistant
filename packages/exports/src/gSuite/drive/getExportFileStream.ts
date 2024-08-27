import { drive_v3 } from "@googleapis/drive";

import { Result } from "../../types";

const MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

/**
 * @description Returns a readable stream for the file.
 */
export async function getExportFileStream({
  drive,
  fileId,
  ext,
}: {
  drive: drive_v3.Drive;
  fileId: string;
  ext: "pdf" | "docx" | "pptx";
}): Promise<Result<{ stream: NodeJS.ReadableStream; mimeType: string }>> {
  try {
    const mimeType = MIME_TYPES[ext];
    const response = await drive.files.export(
      {
        fileId,
        mimeType: MIME_TYPES[ext],
      },
      { responseType: "stream" },
    );

    return { data: { stream: response.data, mimeType } };
  } catch (error) {
    return { error, message: "Failed to get file link" };
  }
}
