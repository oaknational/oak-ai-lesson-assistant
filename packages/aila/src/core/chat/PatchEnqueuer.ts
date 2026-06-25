import { aiLogger } from "@oakai/logger";

import type { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";

const log = aiLogger("aila:protocol");

/**
 * A disconnected client closes the controller, making enqueue throw. Streaming
 * is best-effort, so swallow that error; otherwise the turn aborts before the
 * document and moderation are persisted.
 */
function isControllerClosed(error: unknown): boolean {
  // Some runtimes don't set a `code` on a closed-controller error, so match
  // the TypeError too.
  return (
    error instanceof TypeError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "ERR_INVALID_STATE")
  );
}

// Paths that PatchString schema accepts
type StringPatchPath =
  | "/title"
  | "/keyStage"
  | "/topic"
  | "/subject"
  | "/learningOutcome";

export class PatchEnqueuer {
  private controller?: ReadableStreamDefaultController;

  constructor(controller?: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  public setController(controller: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  private safeEnqueue(encoded: string): void {
    if (!this.controller) {
      throw new Error("Controller not set");
    }
    try {
      this.controller.enqueue(encoded);
    } catch (error) {
      if (isControllerClosed(error)) {
        log.warn("Stream controller already closed; skipping enqueue");
        return;
      }
      log.error("Error enqueuing patch", error);
      throw error;
    }
  }

  private enqueuePromise: Promise<void> = Promise.resolve();
  private enqueueOperation(operation: () => void): Promise<void> {
    this.enqueuePromise = this.enqueuePromise.then(() => {
      return new Promise<void>((resolve) => {
        operation();
        resolve(); // Resolve after the operation is executed
      });
    });
    return this.enqueuePromise;
  }

  public enqueueInitialField(
    path: StringPatchPath,
    value: string,
  ): Promise<void> {
    return this.enqueueOperation(() => {
      const patch = this.createPatch(path, value);
      this.safeEnqueue(this.formatPatch(patch));
    });
  }

  public enqueueMessage(message: JsonPatchDocumentOptional): Promise<void> {
    return this.enqueueOperation(() => {
      this.safeEnqueue(this.formatPatch(message));
    });
  }

  private createPatch(
    path: StringPatchPath,
    value: string,
  ): JsonPatchDocumentOptional {
    return {
      type: "patch",
      reasoning: "generated",
      value: { op: "add" as const, path, value },
      status: "complete",
    };
  }

  private formatPatch(patch: JsonPatchDocumentOptional): string {
    return `\n␞\n${JSON.stringify(patch)}\n␞\n`; // #TODO remove duplicate separators
  }
}
