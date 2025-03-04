import { aiLogger } from "@oakai/logger";

import type { ValidPatchDocument } from "../../../protocol/jsonPatchProtocol";
import { applyLessonPlanPatch } from "../../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "../../../protocol/schema";
import { LessonPlanSchema } from "../schemas/lessonPlan";
import type { AilaDocumentContent, DocumentPlugin } from "../types";

const log = aiLogger("aila");

/**
 * Plugin for handling Lesson Plan documents
 */
export class LessonPlanPlugin implements DocumentPlugin {
  id = "lesson-plan-plugin";

  /**
   * Check if this plugin can handle the given content
   */
  canHandle(): boolean {
    return true; // This plugin is only registered for lesson plans
  }

  /**
   * Create minimal content for a lesson plan
   */
  createMinimalContent(): AilaDocumentContent {
    return {
      title: "",
      subject: "",
      keyStage: "",
      objectives: [],
      lessonPlan: [],
    } as LooseLessonPlan;
  }

  /**
   * Apply a patch to the document content
   */
  applyPatch(
    content: AilaDocumentContent,
    patch: ValidPatchDocument,
  ): AilaDocumentContent | null {
    try {
      const result = applyLessonPlanPatch(content as LooseLessonPlan, patch);
      return result || null; // Convert undefined to null
    } catch (error) {
      log.warn("Failed to apply patch to lesson plan", error);
      return null;
    }
  }

  /**
   * Validate the document content against its schema
   */
  validateContent(content: AilaDocumentContent): AilaDocumentContent | null {
    try {
      return LessonPlanSchema.parse(content as LooseLessonPlan);
    } catch (error) {
      log.warn("Lesson plan content validation failed", error);
      return null;
    }
  }
}
