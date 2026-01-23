import { createSlidesClient } from "./client";
import { getPresentation } from "./getPresentation";

/**
 * Thumbnail data for a single slide
 */
export interface SlideThumbnail {
  /** The slide's object ID */
  objectId: string;
  /** Zero-based index of the slide */
  slideIndex: number;
  /** URL to the thumbnail image (PNG) */
  thumbnailUrl: string;
  /** Width of the thumbnail in pixels */
  width: number;
  /** Height of the thumbnail in pixels */
  height: number;
}

/**
 * Configuration for thumbnail fetching
 */
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES_MS = 500;

/**
 * Delays execution for the specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches thumbnails for all slides in a presentation
 *
 * Uses batching with rate limiting to avoid hitting Google API limits:
 * - Batch size: 10 slides at a time
 * - Delay between batches: 500ms
 *
 * @param presentationId - The Google Slides presentation ID
 * @returns Array of thumbnail data for each slide
 * @throws Error if the presentation or thumbnails cannot be fetched
 *
 * @example
 * ```typescript
 * const thumbnails = await getSlideThumbnails('abc123xyz');
 * thumbnails.forEach(t => console.log(`Slide ${t.slideIndex}: ${t.thumbnailUrl}`));
 * ```
 */
export async function getSlideThumbnails(
  presentationId: string,
): Promise<SlideThumbnail[]> {
  const client = await createSlidesClient();
  const presentation = await getPresentation(presentationId);

  const slides = presentation.slides ?? [];
  const thumbnails: SlideThumbnail[] = [];

  for (let i = 0; i < slides.length; i += BATCH_SIZE) {
    const batch = slides.slice(i, i + BATCH_SIZE);

    // Fetch batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (slide, batchIndex) => {
        const slideIndex = i + batchIndex;
        const objectId = slide.objectId;

        if (!objectId) {
          throw new Error(`Slide at index ${slideIndex} has no objectId`);
        }

        const response = await client.presentations.pages.getThumbnail({
          presentationId,
          pageObjectId: objectId,
          "thumbnailProperties.thumbnailSize": "MEDIUM",
          "thumbnailProperties.mimeType": "PNG",
        });

        const thumbnail = response.data;

        if (!thumbnail?.contentUrl) {
          throw new Error(
            `Failed to get thumbnail URL for slide ${slideIndex}`,
          );
        }

        return {
          objectId,
          slideIndex,
          thumbnailUrl: thumbnail.contentUrl,
          width: thumbnail.width ?? 0,
          height: thumbnail.height ?? 0,
        };
      }),
    );

    thumbnails.push(...batchResults);

    // Delay before next batch (except for the last batch)
    if (i + BATCH_SIZE < slides.length) {
      await delay(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  return thumbnails;
}
