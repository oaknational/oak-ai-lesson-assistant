import type { ValidPatchDocument } from "../../protocol/jsonPatchProtocol";
import type { Message } from "../chat";
import type { AilaDummyDocumentContent } from "./schemas/dummyDocument";
import type { AilaLessonPlanContent } from "./schemas/lessonPlan";

/**
 * Document plugin interface for extending AilaDocument functionality
 */
export interface DocumentPlugin {
  /**
   * Unique identifier for the plugin
   */
  id: string;

  /**
   * Optional method to apply patches in a document-specific way
   */
  applyPatch?: (
    content: AilaDocumentContent,
    patch: ValidPatchDocument,
  ) => AilaDocumentContent | null;

  /**
   * Optional method to validate content in a document-specific way
   */
  validateContent?: (
    content: AilaDocumentContent,
  ) => AilaDocumentContent | null;

  /**
   * Optional method to check if this plugin can handle the given content
   */
  canHandle?: (content: AilaDocumentContent) => boolean;

  /**
   * Optional method to create minimal content for initialization
   * Used when no initial content is provided
   */
  createMinimalContent?: () => AilaDocumentContent;
}

/**
 * Categorisation plugin interface
 */
export interface CategorisationPlugin {
  /**
   * Unique identifier for the plugin
   */
  id: string;

  /**
   * Method to categorise content based on messages
   */
  categoriseFromMessages: (
    messages: Message[],
    currentContent: AilaDocumentContent,
  ) => Promise<AilaDocumentContent | null>;

  /**
   * Method to check if categorisation is needed
   */
  shouldCategorise: (content: AilaDocumentContent) => boolean;
}

/**
 * Union type for all document content types
 */
export type AilaDocumentContent =
  | AilaLessonPlanContent
  | AilaDummyDocumentContent;
