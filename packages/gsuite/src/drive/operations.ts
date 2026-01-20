import { extractFileIdFromUrl } from "../shared/extractIdFromUrl";
import { createDriveClient } from "./client";
import type { CopyFileOptions, CopyFileResult } from "./types";

/**
 * Copies a Google Drive file (including Slides presentations) to a new file
 * @param options - Copy options including source URL, name, and optional destination folder
 * @returns Information about the copied file
 * @throws Error if the copy operation fails
 */
export async function copyFile(
  options: CopyFileOptions,
): Promise<CopyFileResult> {
  const drive = await createDriveClient();
  const fileId = extractFileIdFromUrl(options.sourceUrl);

  try {
    // First, try to get file metadata to verify access and provide better error messages
    try {
      await drive.files.get({
        fileId,
        fields: "id,name,mimeType",
        supportsAllDrives: true,
      });
    } catch (metadataError) {
      // Provide more helpful error message based on the error type
      const errorCode = (metadataError as unknown as { code?: number })?.code;
      if (errorCode === 404) {
        throw new Error(
          `File not found or not accessible: ${fileId}. The file may be private or the service account may not have access. Ensure the file is publicly viewable or shared with the service account.`,
        );
      } else if (errorCode === 403) {
        throw new Error(
          `Permission denied for file: ${fileId}. The service account does not have access to this file. Share the file with the service account or make it publicly accessible.`,
        );
      }
      throw metadataError;
    }

    // Copy the file
    const copyResponse = await drive.files.copy({
      fileId,
      requestBody: {
        name: options.name,
        parents: [options.destinationFolderId],
      },
      fields: "id,name,webViewLink",
      supportsAllDrives: true,
    });

    const copiedFile = copyResponse.data;

    if (!copiedFile.id || !copiedFile.webViewLink || !copiedFile.name) {
      throw new Error("Failed to copy file: incomplete response data");
    }

    return {
      fileId: copiedFile.id,
      webViewLink: copiedFile.webViewLink,
      name: copiedFile.name,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to copy file: ${errorMessage}`);
  }
}

/**
 * Moves a file to a different folder
 * @param fileId - ID of the file to move
 * @param targetFolderId - ID of the destination folder
 * @throws Error if the move operation fails
 */
export async function moveFileToFolder(
  fileId: string,
  targetFolderId: string,
): Promise<void> {
  const drive = await createDriveClient();

  try {
    // Get current parents
    const file = await drive.files.get({
      fileId,
      fields: "parents",
    });

    const previousParents = file.data.parents?.join(",") || "";

    // Move the file by removing from old parents and adding to new parent
    await drive.files.update({
      fileId,
      addParents: targetFolderId,
      removeParents: previousParents,
      fields: "id,parents",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to move file to folder: ${errorMessage}`);
  }
}

export async function setFilePermissions({
  fileId,
  type = "anyone",
  role = "reader",
}: {
  fileId: string;
  type: string;
  role: string;
}): Promise<void> {
  const drive = await createDriveClient();
  try {
    await drive.permissions.create({
      supportsAllDrives: true,
      fileId: fileId,
      requestBody: {
        type: type,
        role: role,
      },
      sendNotificationEmail: false,
    });
  } catch (error) {
    throw new Error(`Failed to set permissions: ${JSON.stringify(error)}`);
  }
}
