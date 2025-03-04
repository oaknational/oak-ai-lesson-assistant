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
  }

  /**
   * Check if categorisation is needed
   */
  shouldCategorise(content: AilaDocumentContent): boolean {
    // Check if essential fields are missing
    const hasTitle = !!content.title;
    const hasSubject = !!content.subject;
    const hasKeyStage = !!content.keyStage;

    // Check if this is a lesson plan
    const isLessonPlan = "objectives" in content || "lessonPlan" in content;

    // Only categorise if it's a lesson plan and missing essential fields
    return isLessonPlan && (!hasTitle || !hasSubject || !hasKeyStage);
  }

  /**
   * Categorise content based on messages
   */
  async categoriseFromMessages(
    messages: Message[],
    currentContent: AilaDocumentContent,
  ): Promise<AilaDocumentContent | null> {
    log.info("Categorising lesson plan based on messages");

    // Use the categoriser to determine lesson plan details
    const result = await this._categoriser.categorise(
      messages,
      currentContent as LooseLessonPlan,
    );

    if (result) {
      log.info("Categorisation successful");
      return result;
    } else {
      log.info("Categorisation failed");
      return null;
    }
  }
}
