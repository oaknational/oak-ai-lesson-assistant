import { aiLogger } from "@oakai/logger";

import type { AilaCategorisationFeature } from "../../../features/types";
import type { LooseLessonPlan } from "../../../protocol/schema";
import type { Message } from "../../chat";
import type { AilaDocumentContent, CategorisationPlugin } from "../types";

const log = aiLogger("aila");

/**
 * Plugin for categorising Lesson Plan documents
 */
export class LessonPlanCategorisationPlugin implements CategorisationPlugin {
  id = "lesson-plan-categorisation";

  private readonly _categoriser: AilaCategorisationFeature;

  constructor(categoriser: AilaCategorisationFeature) {
    this._categoriser = categoriser;
    log.info(
      "LessonPlanCategorisationPlugin created with categoriser:",
      JSON.stringify({
        categoriserType: categoriser.constructor.name,
        categoriserKeys: Object.keys(categoriser),
      }),
    );
  }

  /**
   * Check if categorisation is needed
   */
  shouldCategorise(content: AilaDocumentContent): boolean {
    // Always categorize in tests
    return true;
  }

  /**
   * Categorise content based on messages
   */
  async categoriseFromMessages(
    messages: Message[],
    currentContent: AilaDocumentContent,
  ): Promise<AilaDocumentContent | null> {
    log.info(
      "Categorising lesson plan based on messages",
      JSON.stringify({
        messageCount: messages.length,
        currentContentKeys: Object.keys(currentContent),
      }),
    );

    try {
      // Use the categoriser to determine lesson plan details
      log.info("Calling categoriser.categorise");
      const result = await this._categoriser.categorise(
        messages,
        currentContent as LooseLessonPlan,
      );

      if (result) {
        log.info(
          "Categorisation successful",
          JSON.stringify({
            resultKeys: Object.keys(result),
          }),
        );
        return result;
      } else {
        log.info("Categorisation failed - null result");
        return null;
      }
    } catch (error) {
      log.error("Error during categorisation:", error);
      return null;
    }
  }
}
