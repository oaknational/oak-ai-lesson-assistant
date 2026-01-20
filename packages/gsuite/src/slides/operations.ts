import { copyFile } from "../drive/operations";
import { validateGoogleServiceAccountEnv } from "../shared/auth";
import type {
  DuplicateSlideDeckOptions,
  DuplicateSlideDeckResult,
} from "./types";

/**
 * Duplicates a Google Slides presentation and places it in a specified folder
 *
 * This function:
 * 1. Extracts the presentation ID from the source URL or ID
 * 2. Uses the Drive API to copy the presentation (Slides are Drive files)
 * 3. Places the copy in the configured output folder
 * 4. Returns the new presentation's ID and URL
 *
 * @param options - Options for duplicating the slide deck
 * @returns Information about the duplicated presentation
 * @throws Error if the duplication fails or environment variables are not configured
 *
 * @example
 * ```typescript
 * const result = await duplicateSlideDeck({
 *   sourceUrl: 'https://docs.google.com/presentation/d/abc123/edit',
 *   name: 'My Lesson - Adapted',
 *   destinationFolderId: 'folder123'
 * });
 * console.log(result.presentationUrl); // URL to the new presentation
 * ```
 */
export async function duplicateSlideDeck(
  options: DuplicateSlideDeckOptions,
): Promise<DuplicateSlideDeckResult> {
  try {
    // Validate environment variables are configured
    validateGoogleServiceAccountEnv();

    // Use Drive API to copy the presentation
    // (Slides presentations are Drive files, so we use Drive API to copy them)
    const result = await copyFile({
      sourceUrl: options.sourceUrl,
      name: options.name,
      destinationFolderId: options.destinationFolderId,
    });

    // await setPermissions(result.fileId);

    return {
      presentationId: result.fileId,
      presentationUrl: result.webViewLink,
      name: result.name,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to duplicate slide deck: ${errorMessage}`);
  }
}

/**
 * Duplicates a slide deck using default configuration from environment variables
 * Convenience wrapper around duplicateSlideDeck that uses GOOGLE_DRIVE_OUTPUT_FOLDER_ID
 *
 * @param sourceUrl - Source presentation URL
 * @param name - Name for the duplicated presentation
 * @returns Information about the duplicated presentation
 */
export async function duplicateSlideDeckToDefaultFolder(
  sourceUrl: string,
  name: string,
): Promise<DuplicateSlideDeckResult> {
  const { GOOGLE_DRIVE_OUTPUT_FOLDER_ID } = validateGoogleServiceAccountEnv();

  return duplicateSlideDeck({
    sourceUrl,
    name,
    destinationFolderId: GOOGLE_DRIVE_OUTPUT_FOLDER_ID,
  });
}
