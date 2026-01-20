import type { drive_v3 } from "@googleapis/drive";

/**
 * Result of a file copy operation
 */
export interface CopyFileResult {
  /** ID of the newly created file */
  fileId: string;
  /** Web view link to the file */
  webViewLink: string;
  /** Name of the copied file */
  name: string;
}

/**
 * Options for copying a file
 */
export interface CopyFileOptions {
  /** Source file URL from Google Drive/Docs */
  sourceUrl: string;
  /** Name for the copied file */
  name: string;
  /** folder ID to move the file to after copying */
  destinationFolderId: string;
}

/**
 * Google Drive API client type
 */
export type DriveClient = drive_v3.Drive;
