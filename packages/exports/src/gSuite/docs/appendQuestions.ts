import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import type { Result } from "../../types";
import type { QuestionData } from "./questionHandlers";
import { getQuestionHandler } from "./questionHandlers";

const log = aiLogger("exports");

/**
 * Appends quiz questions to a document using code-based templates.
 * This works alongside the existing populateDoc for metadata.
 */
export async function appendQuestions({
  googleDocs,
  documentId,
  questions,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  questions: QuestionData[];
}): Promise<Result<void>> {
  try {
    // Get document to find end index
    const doc = await googleDocs.documents.get({
      documentId,
    });

    // Get the end index of the document
    const endIndex =
      doc.data.body?.content
        ?.map((element) => element.endIndex || 0)
        .reduce((max, current) => Math.max(max, current), 1) || 1;

    const requests: docs_v1.Schema$Request[] = [];

    // Process each question
    for (const [questionIndex, question] of questions.entries()) {
      // Add question number
      const questionHeader = `\n\nQuestion ${questionIndex + 1}\n\n`;
      requests.push({
        insertText: {
          location: { index: endIndex },
          text: questionHeader,
        },
      });

      // Get the handler for this question type
      const handler = getQuestionHandler(question.type);

      // Generate requests for this question
      const questionRequests = handler.extractAndPrepareContent(
        question,
        endIndex,
      );

      requests.push(...questionRequests);
    }

    // Execute all requests
    if (requests.length > 0) {
      await googleDocs.documents.batchUpdate({
        documentId,
        requestBody: { requests },
      });
    }

    return { status: "success", value: undefined };
  } catch (error) {
    log.error("Error appending questions", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
