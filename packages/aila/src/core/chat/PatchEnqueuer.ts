import { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";

export class PatchEnqueuer {
  private encoder: TextEncoder;
  private controller?: ReadableStreamDefaultController;

  constructor(controller?: ReadableStreamDefaultController) {
    this.encoder = new TextEncoder();
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
    };
  }

  private formatPatch(patch: JsonPatchDocumentOptional): string {
    return `\n␞\n${JSON.stringify(patch)}\n␞\n`; // #TODO remove duplicate separators
  }
}
