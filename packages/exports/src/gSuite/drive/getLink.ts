import type { drive_v3 } from "@googleapis/drive";

import type { Result } from "../../types";

/**
 * @description Returns a link to the file.
 */
export async function getLink({
  drive,
  fileId,
}: {
  drive: drive_v3.Drive;
  fileId: string;
}): Promise<Result<{ link: string }>> {
  try {
    const response = await drive.files.get({
      fileId,
      fields: "webViewLink",
    });

    const url = response.data.webViewLink;

    if (!url) {
      throw new Error("webViewLink not found in response data");
    }

    return { data: { link: url } };
  } catch (error) {
    return { error, message: "Failed to get file link" };
  }
}
