import { slides } from "@googleapis/slides";

import { SLIDES_SCOPES, createGoogleAuthClient } from "../shared/auth";
import type { SlidesClient } from "./types";

/**
 * Creates an authenticated Google Slides API client
 *
 * Uses service account credentials from environment variables.
 *
 * @returns Configured Slides API client
 * @throws Error if environment variables are not configured
 *
 * @example
 * ```typescript
 * const client = await createSlidesClient();
 * const presentation = await client.presentations.get({
 *   presentationId: 'abc123'
 * });
 * ```
 */
export async function createSlidesClient(): Promise<SlidesClient> {
  const auth = createGoogleAuthClient(SLIDES_SCOPES);

  return slides({
    version: "v1",
    auth,
  });
}
