import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import { getGoogleDocsDimensions } from "../../../images/constants";
import { GCS_LATEX_BUCKET_NAME } from "../../../images/gcsCredentials";

const log = aiLogger("exports");

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

const insertLatexImage = (
  image: { url: string; altText: string; startIndex: number },
  startIndex: number,
): docs_v1.Schema$Request => {
  const dimensions = getDimensions(image.url);

  // Request to insert the inline image at the same position
  return {
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
  };
};

const insertStemImage = (
  image: { url: string; altText: string; startIndex: number },
  startIndex: number,
): docs_v1.Schema$Request[] => {
  // Request to insert the inline image at the same position
  return [
    {
      insertText: {
        text: "\n",
        location: {
          index: startIndex,
        },
      },
    },
    {
      insertInlineImage: {
        uri: image.url,
        location: {
          index: startIndex, // Insert at the same startIndex where the Markdown was removed
        },
      },
    },
    {
      insertText: {
        text: "\n",
        location: {
          index: startIndex,
        },
      },
    },
  ];
};

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

    const isLatexImage = image.url.includes(GCS_LATEX_BUCKET_NAME);

    if (isLatexImage) {
      requests.push(
        insertLatexImage(
          image,
          startIndex, // Insert at the same startIndex where the Markdown was removed
        ),
      );
    } else {
      requests.push(
        ...insertStemImage(
          image,
          startIndex, // Insert at the same startIndex where the Markdown was removed
        ),
      );
    }
  });

  return { requests };
}
