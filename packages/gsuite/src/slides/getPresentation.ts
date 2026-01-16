import { createSlidesClient } from "./client";
import type { GoogleSlidesPresentation } from "./types";

/**
 * Fetches raw presentation data from Google Slides API
 *
 * @param presentationId - The Google Slides presentation ID
 * @returns Raw presentation data from the API
 * @throws Error if the presentation cannot be fetched
 *
 * @example
 * ```typescript
 * const presentation = await getPresentation('abc123xyz');
 * console.log(presentation.title);
 * ```
 */
export async function getPresentation(
  presentationId: string,
): Promise<GoogleSlidesPresentation> {
  const client = await createSlidesClient();

  const response = await client.presentations.get({
    presentationId,
  });

  return response.data;
}
