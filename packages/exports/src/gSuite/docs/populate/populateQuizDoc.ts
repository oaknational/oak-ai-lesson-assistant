import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import { QUIZ_IMAGE_MAX_WIDTH } from "../../../images/constants";
import type {
  ImageAttribution,
  QuizV2Question,
} from "../../../schema/input.schema";
import type { Result } from "../../../types";
import { addFooterAttribution } from "../quiz/footerAttribution";
import { generateAllQuizElements } from "../quiz/table-generators";
import { findMarkdownImages } from "../replacements/findMarkdownImages";
import { imageReplacements } from "../replacements/imageReplacements";
import { replaceLatexInDocument } from "../replacements/replaceLatexInDocument";

const log = aiLogger("exports");

interface PopulateDocV2Data {
  lesson_title: string;
  quiz_type: string;
  questions: QuizV2Question[];
  imageAttributions: ImageAttribution[];
}

/**
 * Populate a Google Doc with quiz content using table generators
 */
export async function populateQuizDoc({
  googleDocs,
  documentId,
  data,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  data: PopulateDocV2Data;
}): Promise<Result<{ missingData: string[] }>> {
  try {
    // Get document to find insertion point
    const doc = await googleDocs.documents.get({ documentId });
    if (!doc.data.body?.content) {
      throw new Error("Document has no body content");
    }

    const lastElement = doc.data.body.content[doc.data.body.content.length - 1];
    // Adjust for endIndex pointing after last valid position
    const insertIndex = (lastElement?.endIndex ?? 2) - 1;

    // Generate quiz elements for insertion
    const quizRequests = generateAllQuizElements(insertIndex, data.questions);

    const requests: docs_v1.Schema$Request[] = [
      ...quizRequests,
      // Replace placeholders after inserting content to keep indexes stable
      {
        replaceAllText: {
          containsText: {
            text: "{{lesson_title}}",
            matchCase: false,
          },
          replaceText: data.lesson_title,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: "{{quiz_type}}",
            matchCase: false,
          },
          replaceText: data.quiz_type,
        },
      },
    ];

    // Execute batch update
    await googleDocs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });

    // Convert LaTeX to markdown images
    await replaceLatexInDocument(googleDocs, documentId);

    // Insert image objects for markdown images
    const markdownImages = await findMarkdownImages(googleDocs, documentId);
    const { requests: imageRequests } = imageReplacements(markdownImages, {
      maxHeight: QUIZ_IMAGE_MAX_WIDTH,
      maxWidth: QUIZ_IMAGE_MAX_WIDTH,
    });

    if (imageRequests.length > 0) {
      await googleDocs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: imageRequests,
        },
      });
    }

    await addFooterAttribution(
      googleDocs,
      documentId,
      data.questions,
      data.imageAttributions,
    );

    log.info(`Quiz populated with ${data.questions.length} questions`);

    return {
      data: {
        missingData: [],
      },
    };
  } catch (error) {
    log.error("Error populating quiz document", error);
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error");
    return {
      error: errorObj,
      message:
        error instanceof Error ? error.message : "Failed to populate document",
    };
  }
}
