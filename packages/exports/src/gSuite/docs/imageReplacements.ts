import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

const log = aiLogger("exports");

export function imageReplacements(
  markdownImages: { url: string; altText: string; startIndex: number }[],
): { requests: docs_v1.Schema$Request[] } {
  if (markdownImages.length === 0) {
    log.info("No Markdown images to process.");
    return { requests: [] };
  }

  let cumulativeShift = 0; // Tracks the total index shift from previous operations

  const requests: docs_v1.Schema$Request[] = [];

  markdownImages.forEach((image) => {
    // Construct the full Markdown reference
    const markdownImageReference = `![${image.altText}](${image.url})`;

    const markdownLength = markdownImageReference.length;

    // Adjust the start and end index dynamically based on the cumulative shift
    const adjustedStartIndex = image.startIndex + cumulativeShift;
    const adjustedEndIndex = adjustedStartIndex + markdownLength;

    // Request to delete the exact range of the Markdown reference
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: adjustedStartIndex,
          endIndex: adjustedEndIndex,
        },
      },
    });

    function getDimensions(imageUrl: string) {
      // NOTE: dimensions are in pt. 1px is 0.75pt
      const scale = 3.0;
      // Extract dimensions from URLs like "latex/abc123-100x100.png"
      const dimensions = imageUrl.match(/-(\d+)x(\d+)\.png$/);
      if (dimensions?.[1] && dimensions?.[2]) {
        const width = parseInt(dimensions[1], 10) / scale;
        const height = parseInt(dimensions[2], 10) / scale;
        return { width, height };
      }
      return { width: 150, height: 150 };
    }
    const dimensions = getDimensions(image.url);

    // Request to insert the inline image at the adjusted startIndex
    requests.push({
      insertInlineImage: {
        uri: image.url,
        location: {
          index: adjustedStartIndex, // Insert at the same startIndex where the Markdown was removed
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
    const netShift = 1 - markdownLength; // Inline image adds 1, Markdown removes its length
    cumulativeShift += netShift;
  });

  return { requests };
}
