import { drive_v3 } from "@googleapis/drive";

import { Result } from "../../types";

/**
 * @description Adds the specified user as a reader to the file.
 */
export async function addReader({
  drive,
  fileId,
  email,
}: {
  drive: drive_v3.Drive;
  fileId: string;
  email: string;
}): Promise<Result<null>> {
  try {
    await drive.permissions.create({
      fileId,
      sendNotificationEmail: false,
      requestBody: {
        role: "reader",
        type: "user",
        emailAddress: email,
      },
    });

    return {
      data: null,
    };
  } catch (error) {
    return {
      error,
      message: "Failed to add reader",
    };
  }
}
