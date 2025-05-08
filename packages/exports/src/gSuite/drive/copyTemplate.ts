import type { drive_v3 } from "@googleapis/drive";

import type { Result } from "../../types";

/**
 * @description Copies the template presentation to a new file.
 * @returns The new presentation or document ID
 */
export async function copyTemplate({
  drive,
  templateId,
  newFileName,
  folderId = process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID,
}: {
  drive: drive_v3.Drive;
  templateId: string;
  newFileName: string;
  folderId?: string;
}): Promise<Result<{ fileCopyId: string }>> {
  try {
    if (!folderId) {
      // Having to check this again for the TypeScript compiler
      throw new Error("GOOGLE_DRIVE_OUTPUT_FOLDER_ID is not set");
    }

    const response = await drive.files.copy({
      fileId: templateId,
      supportsAllDrives: true,
      requestBody: {
        name: newFileName,
        parents: [folderId],
      },
    });

    if (!response.data.id) {
      throw new Error("No data.id returned from copy request");
    }

    return {
      data: {
        fileCopyId: response.data.id,
      },
    };
  } catch (error) {
    return {
      error,
      message: "Failed to copy template presentation",
    };
  }
}
