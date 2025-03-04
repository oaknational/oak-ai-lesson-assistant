import { aiLogger } from "@oakai/logger";

import type { AilaCategorisationFeature } from "../../../features/types";
import type { Message } from "../../chat";
import type { AilaDummyDocumentContent } from "../schemas/dummyDocument";
import type { AilaDocumentContent, CategorisationPlugin } from "../types";

const log = aiLogger("aila");

/**
 * Plugin for categorising Dummy Document type
 */
export class DummyDocumentCategorisationPlugin implements CategorisationPlugin {
  id = "dummy-document-categorisation";

  private readonly _categoriser: AilaCategorisationFeature;

  constructor(categoriser: AilaCategorisationFeature) {
    this._categoriser = categoriser;
  }

  /**
   * Check if categorisation is needed
   */
  shouldCategorise(content: AilaDocumentContent): boolean {
    // Check if essential fields are missing
    const hasTitle = !!content.title;
    const hasSubject = !!content.subject;
    const hasKeyStage = !!content.keyStage;

    // Check if this is a dummy document
    const isDummyDocument =
      "body" in content &&
      !("objectives" in content) &&
      !("lessonPlan" in content);

    // Only categorise if it's a dummy document and missing essential fields
    return isDummyDocument && (!hasTitle || !hasSubject || !hasKeyStage);
  }

  /**
   * Categorise content based on messages
   */
  async categoriseFromMessages(
    messages: Message[],
    currentContent: AilaDocumentContent,
  ): Promise<AilaDocumentContent | null> {
    log.info("Categorising dummy document based on messages");

    // Use the categoriser to determine document details
    const result = await this._categoriser.categorise(messages, currentContent);

    if (result) {
      // Ensure the result has the body field for dummy documents
      const dummyResult = result as AilaDummyDocumentContent;
      if (!dummyResult.body) {
        dummyResult.body = "";
      }

      log.info("Categorisation successful");
      return dummyResult;
    } else {
      log.info("Categorisation failed");
      return null;
    }
  }
}
