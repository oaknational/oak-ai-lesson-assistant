import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import { getGoogleDocsDimensions } from "../../../images/constants";

const log = aiLogger("exports");

export function imageReplacements(
  markdownImages: { url: string; altText: string; startIndex: number }[],
): { requests: docs_v1.Schema$Request[] } {
  if (markdownImages.length === 0) {
    log.info("No Markdown images to process.");
    return { requests: [] };
  }

  // Sort images by startIndex in descending order (process from end to beginning)
  const sortedImages = [...markdownImages].sort(
    (a, b) => b.startIndex - a.startIndex,
  );

  const requests: docs_v1.Schema$Request[] = [];

  // Helper function to extract dimensions from image URLs
  function getDimensions(imageUrl: string) {
    // Extract dimensions from URLs like "latex/abc123-100x100.png"
    const dimensions = imageUrl.match(/-(\d+)x(\d+)\.png$/);
    if (dimensions?.[1] && dimensions?.[2]) {
      const scaledWidth = parseInt(dimensions[1], 10);
      const scaledHeight = parseInt(dimensions[2], 10);
      
      return getGoogleDocsDimensions(scaledWidth, scaledHeight);
    }
    throw new Error(`Unable to extract dimensions from image URL: ${imageUrl}`);
  }

  // Process images backwards (from end of document to beginning)
  // This way, replacing images doesn't affect the indices of earlier images
  sortedImages.forEach((image) => {
    // Construct the full Markdown reference
    const markdownImageReference = `![${image.altText}](${image.url})`;
    const markdownLength = markdownImageReference.length;

    // Since we're processing backwards, we can use the original indices directly
    const startIndex = image.startIndex;
    const endIndex = startIndex + markdownLength;

    // Request to delete the exact range of the Markdown reference
    requests.push({
      deleteContentRange: {
        range: {
          startIndex,
          endIndex,
        },
      },
    });

    const dimensions = getDimensions(image.url);

    // Request to insert the inline image at the same position
    requests.push({
      insertInlineImage: {
        uri: image.url,
        location: {
          index: startIndex, // Insert at the same startIndex where the Markdown was removed
        },
        objectSize: {
          height: {
            magnitude: dimensions.height,
            unit: "PT",
          },
          width: {
            magnitude: dimensions.width,
            unit: "PT",
          },
        },
      },
    });
  });

  return { requests };
}
