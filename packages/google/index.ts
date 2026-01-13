/**
 * Google API integration exports
 */

// Shared utilities
export {
  createGoogleAuthClient,
  validateGoogleServiceAccountEnv,
  DRIVE_SCOPES,
  SLIDES_SCOPES,
  DRIVE_AND_SLIDES_SCOPES,
  type GoogleServiceAccountEnv,
} from "./shared";

// Drive operations
export {
  createDriveClient,
  copyFile,
  moveFileToFolder,
  extractFileIdFromUrl,
  type CopyFileOptions,
  type CopyFileResult,
  type DriveClient,
} from "./drive";

// Slides operations
export {
  duplicateSlideDeck,
  duplicateSlideDeckToDefaultFolder,
  type DuplicateSlideDeckOptions,
  type DuplicateSlideDeckResult,
  type SlidesClient,
} from "./slides";
