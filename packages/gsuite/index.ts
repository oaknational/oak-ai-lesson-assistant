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
} from "./src/shared";

// Drive operations
export {
  createDriveClient,
  copyFile,
  moveFileToFolder,
  extractFileIdFromUrl,
  type CopyFileOptions,
  type CopyFileResult,
  type DriveClient,
} from "./src/drive";

// Slides operations
export {
  // Client
  createSlidesClient,
  // Operations
  duplicateSlideDeck,
  duplicateSlideDeckToDefaultFolder,
  getPresentation,

  // Types
  type SlidesClient,
  type GoogleSlidesPresentation,
  type GoogleSlidesPage,
  type GoogleSlidesPageElement,
  type GoogleSlidesTextElement,
  type GoogleSlidesTable,
  type GoogleSlidesShape,
  type GoogleSlidesPlaceholder,
  type DuplicateSlideDeckOptions,
  type DuplicateSlideDeckResult,
} from "./src/slides";
