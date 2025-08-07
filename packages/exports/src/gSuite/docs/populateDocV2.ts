import { aiLogger } from "@oakai/logger";

import { docs_v1 } from "@googleapis/docs";

import type { Result } from "../../types";
import { findMarkdownImages } from "./findMarkdownImages";
import { imageReplacements } from "./imageReplacements";
import type { QuestionData } from "./questionHandlers";
import { getQuestionHandler } from "./questionHandlers";

const log = aiLogger("exports");

interface PopulateDocV2Data {
  lesson_title: string;
  quiz_type: string;
  questions: QuestionData[];
}

export async function populateDocV2({
  googleDocs,
  documentId,
  data,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  data: PopulateDocV2Data;
}): Promise<Result<{ questionsProcessed: number }>> {
  try {
    const requests: docs_v1.Schema$Request[] = [];

    // Replace title and quiz type placeholders
    requests.push({
      replaceAllText: {
        containsText: {
          text: "{{lesson_title}}",
          matchCase: false,
        },
        replaceText: data.lesson_title,
      },
    });

    requests.push({
      replaceAllText: {
        containsText: {
          text: "{{quiz_type}}",
          matchCase: false,
        },
        replaceText: data.quiz_type,
      },
    });

    // Add each question using the appropriate handler
    for (const [index, question] of data.questions.entries()) {
      const handler = getQuestionHandler(question.type);
      const questionRequests = handler.extractAndPrepareContent(
        question,
        0, // We're using endOfSegmentLocation, so index doesn't matter
        index + 1, // Question number (1-based)
      );

      requests.push(...questionRequests);

      // Add spacing between questions
      if (index < data.questions.length - 1) {
        requests.push({
          insertText: {
            endOfSegmentLocation: {},
            text: "\n\n",
          },
        });
      }
    }

    // Execute all requests in a single batch
    await googleDocs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });

    // Find and replace markdown images with inline images
    const markdownImages = await findMarkdownImages(googleDocs, documentId);
    const { requests: imageRequests } = imageReplacements(markdownImages);

    if (imageRequests.length > 0) {
      await googleDocs.documents.batchUpdate({
        documentId,
        requestBody: { requests: imageRequests },
      });
    }

    log.info(
      `Populated document with ${data.questions.length} questions, replaced ${markdownImages.length} images`,
    );

    return {
      data: {
        questionsProcessed: data.questions.length,
      },
    };
  } catch (error) {
    log.error("Failed to populate document with V2 handler:", error);
    return {
      error,
      message: "Failed to populate doc template with dynamic questions",
    };
  }
}
