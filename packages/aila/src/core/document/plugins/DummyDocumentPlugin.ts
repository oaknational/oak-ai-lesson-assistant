import { aiLogger } from "@oakai/logger";
import { applyPatch } from "fast-json-patch";

import type { ValidPatchDocument } from "../../../protocol/jsonPatchProtocol";
import { DummyDocumentSchema } from "../schemas/dummyDocument";
import type { AilaDummyDocumentContent } from "../schemas/dummyDocument";
import type { AilaDocumentContent, DocumentPlugin } from "../types";

const log = aiLogger("aila");

/**
 * Plugin for handling Dummy Document type
 */
export class DummyDocumentPlugin implements DocumentPlugin {
  id = "dummy-document-plugin";

  /**
   * Check if this plugin can handle the given content
   */
  canHandle(): boolean {
    return true; // This plugin is only registered for dummy documents
  }

  /**
   * Create minimal content for a dummy document
   */
  createMinimalContent(): AilaDocumentContent {
    return {
      title: "",
      subject: "",
      keyStage: "",
      body: "",
    } as AilaDummyDocumentContent;
  }

  /**
   * Apply a patch to the document content
   */
  applyPatch(
    content: AilaDocumentContent,
    patch: ValidPatchDocument,
  ): AilaDocumentContent | null {
    try {
      const patchResult = applyPatch(content, [patch.value], true, false);
      return patchResult.newDocument;
    } catch (error) {
      log.warn("Failed to apply patch to dummy document", error);
      return null;
    }
  }

  /**
   * Validate the document content against its schema
   */
  validateContent(content: AilaDocumentContent): AilaDocumentContent | null {
    try {
      return DummyDocumentSchema.parse(content) as AilaDocumentContent;
    } catch (error) {
      log.warn("Dummy document content validation failed", error);
      return null;
    }
  }
}
