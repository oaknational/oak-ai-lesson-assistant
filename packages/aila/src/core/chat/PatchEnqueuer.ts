import { aiLogger } from "@oakai/logger";

import type { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";

const log = aiLogger("aila:protocol");

export class PatchEnqueuer {
  private controller?: ReadableStreamDefaultController;

  constructor(controller?: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  public setController(controller: ReadableStreamDefaultController) {
    this.controller = controller;
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

  public enqueuePatch(
    path: string,
    value: string | number | string[] | object,
  ): Promise<void> {
    return this.enqueueOperation(() => {
      if (!this.controller) {
        throw new Error("Controller not set");
      }
      const patch = this.createPatch(path, value);
      const encodedPatch = this.formatPatch(patch);
      try {
        this.controller.enqueue(encodedPatch);
      } catch (error) {
        log.error("Error enqueuing patch", error);
        throw error;
      }
    });
  }

  public enqueueMessage(message: JsonPatchDocumentOptional): Promise<void> {
    return this.enqueueOperation(() => {
      if (!this.controller) {
        throw new Error("Controller not set");
      }
      const encodedMessage = this.formatPatch(message);
      this.controller.enqueue(encodedMessage);
    });
  }

  private createPatch(
    path: string,
    value: string | number | string[] | object,
  ): JsonPatchDocumentOptional {
    return {
      type: "patch",
      reasoning: "generated",
      value: { op: "add", path, value },
      status: "complete",
    };
  }

  // TODO: replace all RS with custom data messages?
  private formatPatch(patch: JsonPatchDocumentOptional): string {
    return `\n␞\n${JSON.stringify(patch)}\n␞\n`; // #TODO remove duplicate separators
  }
}
