import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { createSlidesClient } from "./client";
import type { GoogleSlidesPresentation } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));
// const fixturesDir = __dirname;

/**
 * Fetches raw presentation data from Google Slides API
 *
 * @param presentationId - The Google Slides presentation ID
 * @param updateFixtures - If true, writes the fetched presentation to the fixtures folder (default: false)
 * @returns Raw presentation data from the API
 * @throws Error if the presentation cannot be fetched
 *
 * @example
 * ```typescript
 * const presentation = await getPresentation('abc123xyz');
 * console.log(presentation.title);
 *
 * // Update fixtures
 * const presentation = await getPresentation('abc123xyz', true);
 * ```
 */
export async function getPresentation(
  presentationId: string,
  updateFixtures = false, // change to true to update fixtures
): Promise<GoogleSlidesPresentation> {
  const client = await createSlidesClient();

  const response = await client.presentations.get({
    presentationId,
  });

  if (updateFixtures) {
    const fixturesPath = join(
      __dirname,
      "../__fixtures__",
      `${presentationId}.json`,
    );
    await writeFile(
      fixturesPath,
      JSON.stringify(response.data, null, 2),
      "utf-8",
    );
  }

  return response.data;
}
