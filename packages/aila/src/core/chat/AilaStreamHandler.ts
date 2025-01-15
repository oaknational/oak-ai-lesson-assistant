import { aiLogger } from "@oakai/logger";
import type { ReadableStreamDefaultController } from "stream/web";
import invariant from "tiny-invariant";

import { AilaThreatDetectionError } from "../../features/threatDetection/types";
import { AilaChatError } from "../AilaError";
import type { AilaChat } from "./AilaChat";
import type { PatchEnqueuer } from "./PatchEnqueuer";
import { createStreamReaderFromURL } from "./createStreamReaderFromURL";

const log = aiLogger("aila:stream");
export class AilaStreamHandler {
  private readonly _chat: AilaChat;
  private _controller?: ReadableStreamDefaultController;
  private readonly _patchEnqueuer: PatchEnqueuer;
  private _streamReader?: ReadableStreamDefaultReader<string>;

  constructor(chat: AilaChat) {
    this._chat = chat;
    this._patchEnqueuer = chat.getPatchEnqueuer();
  }

  public startStreaming(abortController?: AbortController): ReadableStream {
    return new ReadableStream({
      start: (controller) => {
        this.stream(controller, abortController).catch((error) => {
          log.error("Error in stream:", error);
          controller.error(error);
        });
      },
    });
  }

  private logStreamingStep(step: string) {
    log.info(`Streaming step: ${step}`);
  }

  private async stream(
    controller: ReadableStreamDefaultController,
    abortController?: AbortController,
  ) {
    this.setupController(controller);
    try {
      await this._chat.setupGeneration();
      this.logStreamingStep("Setup generation complete");

      await this._chat.handleSettingInitialState();
      this.logStreamingStep("Handle initial state complete");

      await this._chat.handleSubjectWarning();
      this.logStreamingStep("Handle subject warning complete");

      await this.startLLMStream();
      this.logStreamingStep("Start LLM stream complete");

      await this.readFromStream(abortController);
      this.logStreamingStep("Read from stream complete");

      log.info(
        "Finished reading from stream",
        this._chat.iteration,
        this._chat.id,
      );
    } catch (e) {
      this.handleStreamError(e);
      log.info("Stream error", e, this._chat.iteration, this._chat.id);
    } finally {
      try {
        await this._chat.complete();
        log.info("Chat completed", this._chat.iteration, this._chat.id);
      } catch (e) {
        this._chat.aila.errorReporter?.reportError(e);
        controller.error(
          new AilaChatError("Chat completion failed", { cause: e }),
        );
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

  private async startLLMStream() {
    await this._chat.enqueue({
      type: "comment",
      value: "CHAT_START",
    });
    const currentLessonPlan = this._chat.aila.lessonPlan;

    const AILA_ENGINE_STREAM_URL = process.env.AILA_ENGINE_STREAM_URL;

    const lastUserMessage = this._chat.messages.slice(-1)[0];
    if (AILA_ENGINE_STREAM_URL) {
      this._streamReader = await createStreamReaderFromURL(
        `${AILA_ENGINE_STREAM_URL}?prompt=${JSON.stringify(currentLessonPlan)}\n\n${lastUserMessage?.content}`,
      );
    } else {
      const messages = this._chat.completionMessages();
      this._streamReader =
        await this._chat.createChatCompletionObjectStream(messages);
    }
  }

  private async readFromStream(abortController?: AbortController) {
    if (!this._streamReader) {
      throw new Error("Stream reader is not defined");
    }
    try {
      while (true) {
        const { done, value } = await this._streamReader.read();
        if (done) {
          break;
        }
        if (value) {
          this._chat.appendChunk(value);
          this._controller?.enqueue(value);
        }
      }
    } catch (e) {
      if (abortController?.signal.aborted) {
        log.info("Stream aborted", this._chat.iteration, this._chat.id);
      } else {
        throw e;
      }
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
}
