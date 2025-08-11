import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import type { Result } from "../../types";
import type { QuestionData } from "./questionHandlers";
import { getQuestionHandler } from "./questionHandlers";

const log = aiLogger("exports");

/**
 * Appends quiz questions to a document by copying content from template tabs.
 * This is designed to work alongside the existing populateDoc for metadata.
 */
export async function appendQuestionsFromTabs({
  googleDocs,
  documentId,
  questions,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  questions: QuestionData[];
}): Promise<Result<void>> {
  try {
    // Get document with tabs
    const doc = await googleDocs.documents.get({
      documentId,
      includeTabsContent: true,
    });

    if (!doc.data.tabs) {
      return {
        status: "error",
        message: "Document does not have tabs",
      };
    }

    // Find template tabs
    const templateTabs = doc.data.tabs.filter((tab) =>
      tab.tabProperties?.title?.startsWith("TEMPLATE-"),
    );

    if (templateTabs.length === 0) {
      return {
        status: "error",
        message: "No template tabs found in document",
      };
    }

    // Get the end index of the main document body
    const endIndex =
      doc.data.body?.content
        ?.map((element) => element.endIndex || 0)
        .reduce((max, current) => Math.max(max, current), 1) || 1;

    const requests: docs_v1.Schema$Request[] = [];

    // Process each question
    for (const [questionIndex, question] of questions.entries()) {
      // Find the appropriate template tab
      const templateTabName = `TEMPLATE-${question.type.toUpperCase()}`;
      const templateTab = templateTabs.find(
        (tab) => tab.tabProperties?.title === templateTabName,
      );

      if (!templateTab?.documentTab?.body?.content) {
        log.error(`Template tab not found: ${templateTabName}`);
        continue;
      }

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

      // Extract and prepare content
      const questionRequests = handler.extractAndPrepareContent(
        templateTab.documentTab.body.content,
        question,
        endIndex,
      );

      requests.push(...questionRequests);
    }

    // Delete all template tabs
    for (const tab of templateTabs) {
      if (tab.tabProperties?.tabId) {
        // Delete tab by deleting all its content
        const tabEndIndex =
          tab.documentTab?.body?.content
            ?.map((element) => element.endIndex || 0)
            .reduce((max, current) => Math.max(max, current), 1) || 1;

        requests.push({
          deleteContentRange: {
            range: {
              tabId: tab.tabProperties.tabId,
              startIndex: 0,
              endIndex: tabEndIndex,
            },
          },
        });
      }
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
    log.error("Error appending questions from tabs", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
