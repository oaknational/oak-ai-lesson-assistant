import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import type { QuizV2Question } from "../../../schema/input.schema";
import type { Result } from "../../../types";
import { generateAllQuizTables } from "../quiz/table-generators";
import { findMarkdownImages } from "../replacements/findMarkdownImages";
import { imageReplacements } from "../replacements/imageReplacements";
import { replaceLatexInDocument } from "../replacements/replaceLatexInDocument";

const log = aiLogger("exports");

interface PopulateDocV2Data {
  lesson_title: string;
  quiz_type: string;
  questions: QuizV2Question[];
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
    // Get the document to find the end index
    const doc = await googleDocs.documents.get({ documentId });
    if (!doc.data.body?.content) {
      throw new Error("Document has no body content");
    }

    const lastElement = doc.data.body.content[doc.data.body.content.length - 1];
    // Subtract 1 since endIndex points after the last valid position
    const insertIndex = (lastElement?.endIndex ?? 2) - 1;

    // Generate quiz tables and placeholder replacements
    const quizRequests = generateAllQuizTables(insertIndex, data.questions);

    const requests: docs_v1.Schema$Request[] = [
      ...quizRequests,
      // Replace placeholders after inserting content
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

    // Execute all requests
    await googleDocs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });

    // Replace LaTeX patterns with markdown image syntax
    await replaceLatexInDocument(googleDocs, documentId);

    // 6. Insert image objects for markdown images
    const markdownImages = await findMarkdownImages(googleDocs, documentId);
    const { requests: imageRequests } = imageReplacements(markdownImages);

    if (imageRequests.length > 0) {
      await googleDocs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: imageRequests,
        },
      });
    }

    log.info(`Quiz populated with ${data.questions.length} questions`);

    return {
      data: {
        missingData: [],
      },
    };
  } catch (error) {
    log.error("Error populating quiz document", error);
    return {
      error: error instanceof Error ? error : new Error("Unknown error"),
      message:
        error instanceof Error ? error.message : "Failed to populate document",
    };
  }
}
