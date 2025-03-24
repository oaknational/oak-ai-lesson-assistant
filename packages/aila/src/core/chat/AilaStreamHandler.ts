import { createVercelOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";
import { createDataStream, generateId, streamText, Output } from "ai";
import { LLMMessageSchema } from "protocol/jsonPatchProtocol";

import type { AilaChat } from "./AilaChat";

const log = aiLogger("aila:stream");

export class AilaStreamHandler {
  private readonly _chat: AilaChat;

  constructor(chat: AilaChat) {
    // TODO: can this be replaced?
    // maybe by passing into startStreaming?
    // maybe with a new class/module for setup/teardown actions
    this._chat = chat;
  }

  public startStreaming(abortController: AbortController): ReadableStream {
    // TODO: using createDataStream to return a readablestream, but it might be better to return the response
    // return createDataStreamResponse({
    return createDataStream({
      execute: async (dataStream) => {
        await this._chat.initialSetup(dataStream);

        // dataStream.writeData("initialized call");
        // dataStream.writeMessageAnnotation("test annotation");
        // NOTE: errors halt processing on the client
        // dataStream.write(`3:"custom error"\n`);

        const openAIProvider = createVercelOpenAIClient({
          chatMeta: { userId: "dummy", chatId: "dummy" },
          app: "lesson-assistant",
        });
        const model = openAIProvider("gpt-4o", { structuredOutputs: true });
        const messages = this._chat.completionMessages();
        const chatClass = this._chat;

        // TODO: streamText is shortcutting OpenAiService
        const result = streamText({
          model,
          messages, // TODO: map role and content
          experimental_output: Output.object({
            schema: LLMMessageSchema,
          }),
          abortSignal: abortController.signal,
          // TODO: temperature
          onChunk() {
            // dataStream.writeMessageAnnotation({ chunk: "123" });
            // appendChunk(chunk);
          },
          async onFinish({ text, usage, response }) {
            // message annotation:
            dataStream.writeMessageAnnotation({
              id: generateId(), // e.g. id from saved DB record
              other: "information",
            });

            // call annotation:
            // dataStream.writeData("call completed");

            await chatClass.complete(
              text,
              usage,
              response.messages,
              dataStream,
            );
          },
        });

        //
        // TODO: can we use mergeIntoDataStream for other types of data?
        // eg rag

        result.mergeIntoDataStream(dataStream);
      },
      onError: (error) => {
        // Error messages are masked by default for security reasons.
        // If you want to expose the error message to the client, you can do so here:
        return error instanceof Error ? error.message : String(error);
      },
    });
  }
<<<<<<< Updated upstream

  private logStreamingStep(step: string) {
    log.info(`Streaming step: ${step}`);
  }

  private async checkForThreats(
    messages?: {
      role: "system" | "assistant" | "user" | "data";
      content: string;
    }[],
  ) {
    const messagesToCheck = messages ?? this._chat.messages;
    log.info("Starting threat check");
    if (!this._chat.aila.threatDetection?.detectors) {
      log.info("No threat detectors configured");
      return;
    }

    const lastMessage = messagesToCheck[this._chat.messages.length - 1];
    if (!lastMessage) {
      log.info("No messages to check for threats");
      return;
    }

    const detectors = this._chat.aila.threatDetection?.detectors ?? [];
    for (const detector of detectors) {
      log.info("Running detector", { detector: detector.constructor.name });
      const result = await detector.detectThreat(messagesToCheck);
      if (result.isThreat) {
        log.info("Threat detected", { result });
        throw new AilaThreatDetectionError(
          this._chat.userId ?? "unknown",
          "Potential threat detected",
          { cause: result },
        );
      }
    }
    log.info("Threat check complete - no threats found");
  }

  private async stream(
    controller: ReadableStreamDefaultController,
    abortController?: AbortController,
  ) {
    log.info("Starting stream", { chatId: this._chat.id });
    this.setupController(controller);
    try {
      log.info("Setting up generation");
      await this._chat.setupGeneration();
      this.logStreamingStep("Setup generation complete");

      log.info("Checking for threats for the user input");
      await this.checkForThreats();
      this.logStreamingStep("Check for threats complete");

      log.info("Setting initial state");
      await this._chat.handleSettingInitialState();
      this.logStreamingStep("Handle initial state complete");

      log.info("Handling subject warning");
      await this._chat.handleSubjectWarning();
      this.logStreamingStep("Handle subject warning complete");

      log.info("Starting LLM stream");
      await this.startLLMStream();
      this.logStreamingStep("Start LLM stream complete");

      log.info("Reading from stream");
      await this.readFromStream(abortController);
      this.logStreamingStep("Read from stream complete");

      log.info(
        "Finished reading from stream",
        this._chat.iteration,
        this._chat.id,
      );
    } catch (e) {
      log.info("Caught error in stream", {
        error: e,
        type: e?.constructor?.name,
      });
      if (e instanceof AilaThreatDetectionError) {
        log.info("Handling threat detection error");
        await this._chat.generationFailed(e);
        throw e;
      }
      await this.handleStreamError(e);
      log.info("Stream error", e, this._chat.iteration, this._chat.id);
    } finally {
      const status = this._chat.generation?.status;
      log.info("In finally block", { status, chatId: this._chat.id });
      if (!(status === "FAILED")) {
        try {
          log.info("Completing chat");
          await this._chat.complete();
          log.info("Chat completed", this._chat.iteration, this._chat.id);
        } catch (e) {
          log.error("Error in complete", e);
          this._chat.aila.errorReporter?.reportError(e);
          controller.error(
            new AilaChatError("Chat completion failed", { cause: e }),
          );
        }
      }
      this.closeController();
      log.info("Stream closed", this._chat.iteration, this._chat.id);
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
    const messages = this._chat.completionMessages();
    this._streamReader =
      await this._chat.createChatCompletionObjectStream(messages);
  }

  private async readFromStream(abortController?: AbortController) {
    if (!this._streamReader) {
      throw new Error("Stream reader is not defined");
    }
    log.info("Starting to read from stream");
    try {
      while (abortController ? !abortController?.signal.aborted : true) {
        log.info("Reading next chunk");
        const { done, value } = await this._streamReader.read();
        if (done) {
          log.info("Stream reading complete");
          break;
        }
        if (value) {
          log.info("Processing chunk", { valueLength: value.length });
          this._chat.appendChunk(value);
          this._controller?.enqueue(value);
        } else {
          log.info("Received empty chunk");
        }
      }
    } catch (e) {
      log.error("Error reading from stream", { error: e });
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
      if (error instanceof AilaThreatDetectionError) {
        throw error;
      }

      const detectors = this._chat.aila.threatDetection?.detectors ?? [];
      for (const detector of detectors) {
        if (await detector.isThreatError(error)) {
          throw new AilaThreatDetectionError(
            this._chat.userId ?? "unknown",
            "Threat detected",
            { cause: error },
          );
        }
      }
      this._chat.aila.errorReporter?.reportError(error);
      throw new AilaChatError(error.message, { cause: error });
    } else {
      throw new AilaChatError("Unknown error", { cause: error });
    }
  }

  private closeController() {
    if (this._controller) {
      this._controller.close();
    }
  }
=======
>>>>>>> Stashed changes
}
