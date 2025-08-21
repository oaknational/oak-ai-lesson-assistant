/**
 * Utility for adding attribution text to document footers with proper formatting
 */
import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import { formatQuizAttributions } from "../../../quiz-utils/attribution/formatAttribution";
import type {
  ImageAttribution,
  QuizV2Question,
} from "../../../schema/input.schema";
import { getFooterStrategy } from "./estimate-page-breaks";

const log = aiLogger("exports");

/**
 * Generate footer insertion requests for attribution text with formatting
 */
function generateFooterAttributionRequests(
  footerId: string,
  attributionData: ReturnType<typeof formatQuizAttributions>,
): docs_v1.Schema$Request[] {
  if (attributionData.segments.length === 0) {
    return [];
  }

  const requests: docs_v1.Schema$Request[] = [];

  // First, insert all text segments in reverse order
  const textRequests = attributionData.segments
    .slice()
    .reverse()
    .map((segment) => ({
      insertText: {
        location: {
          index: 0,
          segmentId: footerId,
        },
        text: segment.text,
      },
    }));

  requests.push(...textRequests);

  // Then add formatting requests for bold segments
  let currentIndex = 0;
  attributionData.segments.forEach((segment) => {
    if (segment.bold) {
      requests.push({
        updateTextStyle: {
          range: {
            segmentId: footerId,
            startIndex: currentIndex,
            endIndex: currentIndex + segment.text.length,
          },
          textStyle: {
            bold: true,
          },
          fields: "bold",
        },
      });
    }
    currentIndex += segment.text.length;
  });

  return requests;
}

/**
 * Add attribution to appropriate footers based on content length
 */
export async function addFooterAttribution(
  googleDocs: docs_v1.Docs,
  documentId: string,
  questions: QuizV2Question[],
  imageAttributions: ImageAttribution[],
): Promise<void> {
  // Get document style to access footer IDs
  const doc = await googleDocs.documents.get({ documentId });
  const documentStyle = doc.data.documentStyle;

  if (!documentStyle?.defaultFooterId) {
    throw new Error(
      "Document template missing default footer - cannot add attribution",
    );
  }

  // Generate attribution data
  const attributionData = formatQuizAttributions(questions, imageAttributions);

  if (attributionData.segments.length === 0) {
    log.info("No image attributions to add");
    return;
  }

  // Determine footer strategy based on content length
  const footerStrategy = getFooterStrategy(questions);
  const footerRequests: docs_v1.Schema$Request[] = [];

  if (footerStrategy === "both-footers") {
    // Add to both first page and default footers (single page content)
    if (documentStyle.firstPageFooterId) {
      footerRequests.push(
        ...generateFooterAttributionRequests(
          documentStyle.firstPageFooterId,
          attributionData,
        ),
      );
    }
    footerRequests.push(
      ...generateFooterAttributionRequests(
        documentStyle.defaultFooterId,
        attributionData,
      ),
    );
    log.info("Added attribution to both footers (single page strategy)");
  } else {
    // Add only to default footer (multi-page content)
    footerRequests.push(
      ...generateFooterAttributionRequests(
        documentStyle.defaultFooterId,
        attributionData,
      ),
    );
    log.info("Added attribution to global footer only (multi-page strategy)");
  }

  if (footerRequests.length > 0) {
    await googleDocs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: footerRequests,
      },
    });
  }
}
