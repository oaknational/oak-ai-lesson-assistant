import type { slides_v1 } from "@googleapis/slides";

import { createSlidesClient } from "./client";

/**
 * Applies a batch of requests to a Google Slides presentation.
 *
 * @param presentationId - The Google Slides presentation ID
 * @param requests - Array of Google Slides API requests to apply
 * @returns The batch update response
 * @throws Error if the update fails (e.g., permission denied)
 */
export async function batchUpdate(
  presentationId: string,
  requests: slides_v1.Schema$Request[],
): Promise<slides_v1.Schema$BatchUpdatePresentationResponse> {
  const client = await createSlidesClient();

  const response = await client.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });

  if (response.status !== 200 || !response.data) {
    throw new Error(
      `Failed to apply batch update: ${response.status} ${response.statusText}`,
    );
  }

  return response.data;
}
