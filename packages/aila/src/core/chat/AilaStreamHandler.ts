import { aiLogger } from "@oakai/logger";
import { ReadableStreamDefaultController } from "stream/web";
import invariant from "tiny-invariant";

import { AilaThreatDetectionError } from "../../features/threatDetection/types";
import { AilaChatError } from "../AilaError";
import { AilaChat } from "./AilaChat";
import { PatchEnqueuer } from "./PatchEnqueuer";

const log = aiLogger("aila:stream");
export class AilaStreamHandler {
  private _chat: AilaChat;
  private _controller?: ReadableStreamDefaultController;
  private _patchEnqueuer: PatchEnqueuer;
  private _isStreaming: boolean = false;
  private _streamReader?: ReadableStreamDefaultReader<string>;
  private _abortController?: AbortController;

  constructor(chat: AilaChat) {
    this._chat = chat;
    this._patchEnqueuer = chat.getPatchEnqueuer();
  }

  public startStreaming(abortController?: AbortController): ReadableStream {
    return new ReadableStream({
      start: async (controller) => {
        await this.stream(controller, abortController);
      },
    });
  }

  private async stream(
    controller: ReadableStreamDefaultController,
    abortController?: AbortController,
  ) {
    this.setupController(controller);
    this.listenForAbort(abortController);
    try {
      await this._chat.setupGeneration();
      await this._chat.handleSettingInitialState();
      await this._chat.handleSubjectWarning();
      await this.startLLMStream();
      while (this._isStreaming) {
        await this.readFromStream();
      }
    } catch (e) {
      this.handleStreamError(e);
      log.info("Stream error", e, this._chat.iteration, this._chat.id);
    } finally {
      this._isStreaming = false;
      try {
        await this._chat.complete();
        log.info("Chat completed", this._chat.iteration, this._chat.id);
      } finally {
        this.closeController();
        log.info("Stream closed", this._chat.iteration, this._chat.id);
      }
    }
  }

  private setupController(controller: ReadableStreamDefaultController) {
    this._controller = controller;
    this._patchEnqueuer.setController(controller);
  }

  private listenForAbort(abortController?: AbortController) {
    if (!abortController) {
      return;
    }
    if (this._abortController) {
      this._abortController.signal.removeEventListener(
        "abort",
        this.stopStreamingOnAbort,
      );
    }
    this._abortController = abortController;
    this._abortController.signal.addEventListener(
      "abort",
      this.stopStreamingOnAbort,
    );
  }

  private async startLLMStream() {
    await this._chat.enqueue({
      type: "comment",
      value: "CHAT_START",
    });
    const messages = await this._chat.completionMessages();
    this._streamReader =
      await this._chat.createChatCompletionObjectStream(messages);
    this._isStreaming = true;
  }

  private async readFromStream() {
    try {
      await this.fetchChunkFromStream();
    } catch (error) {
      await this._chat.generationFailed(error);
    }
  }

  private async handleStreamError(error: unknown) {
    for (const plugin of this._chat.aila.plugins ?? []) {
      await plugin.onStreamError?.(error, {
        aila: this._chat.aila,
        enqueue: this._chat.enqueue,
      });
    }

    if (error instanceof Error) {
      if (this._chat.aila.threatDetection?.detector.isThreat(error)) {
        invariant(this._chat.userId, "User ID is required");
        throw new AilaThreatDetectionError(
          this._chat.userId,
          "Threat detected",
          { cause: error },
        );
      } else {
        this._chat.aila.errorReporter?.reportError(error);
        throw new AilaChatError(error.message, { cause: error });
      }
    } else {
      throw new AilaChatError("Unknown error", { cause: error });
    }
  }

  private closeController() {
    if (this._controller) {
      this._controller.close();
    }
  }

  private async fetchChunkFromStream() {
    if (this._streamReader) {
      const { done, value } = await this._streamReader.read();
      if (value) {
        this._chat.appendChunk(value);
        this._controller?.enqueue(value);
      }
      if (done) {
        this._isStreaming = false;
      }
    }
  }

  private stopStreamingOnAbort = () => {
    this._isStreaming = false;
  };
}
