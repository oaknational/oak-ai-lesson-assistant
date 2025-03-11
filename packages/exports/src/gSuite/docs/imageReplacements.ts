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

    // Request to insert the inline image at the adjusted startIndex
    requests.push({
      insertInlineImage: {
        uri: image.url,
        location: {
          index: adjustedStartIndex, // Insert at the same startIndex where the Markdown was removed
        },
        objectSize: {
          height: {
            magnitude: 150,
            unit: "PT",
          },
          width: {
            magnitude: 150,
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
