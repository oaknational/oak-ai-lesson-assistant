import { aiLogger } from "@oakai/logger";
import { getRagLessonPlansByIds } from "@oakai/rag";

import type { ReadableStreamDefaultController } from "stream/web";

import { AilaThreatDetectionError } from "../../features/threatDetection/types";
import {
  createInteractStreamHandler,
  streamInteractResultToClient,
} from "../../lib/agents/compatibility/streamHandling";
import { interact } from "../../lib/agents/interact";
import { fetchRelevantLessonPlans } from "../../lib/agents/rag/fetchReleventLessons.agent";
import { AilaChatError } from "../AilaError";
import type { AilaChat } from "./AilaChat";
import type { PatchEnqueuer } from "./PatchEnqueuer";

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

  private async span(step: string, handler: () => Promise<void>) {
    log.info(`${step} started`);
    await this._chat.aila.tracing.span(step, { op: "aila.step" }, handler);
    log.info(`${step} finished`);
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
      if (!this._chat.aila.options.useAgenticAila) {
        await this.span("aila-set-up-generation", async () => {
          await this._chat.setupGeneration();
        });
      } else {
        await this.span("aila-initialise-chunks", async () => {
          this._chat.initialiseChunks();
        });
      }

      await this.span("aila-check-threats", async () => {
        await this.checkForThreats();
      });

      await this.span("aila-set-initial-state", async () => {
        await this._chat.handleSettingInitialState();
      });

      await this.span("aila-handle-subject-warning", async () => {
        await this._chat.handleSubjectWarning();
      });

      if (this._chat.aila.options.useAgenticAila) {
        await this.span("aila-start-agent-stream", async () => {
          await this.startAgentStream();
        });
      } else {
        await this.span("aila-start-llm-stream", async () => {
          await this.startLLMStream();
        });
        await this.span("aila-read-from-stream", async () => {
          await this.readFromStream(abortController);
        });
      }

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
      if (status !== "FAILED") {
        try {
          await this.span("aila-chat-completion", async () => {
            await this._chat.complete();
          });
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

  private async startAgentStream() {
    await this._chat.enqueue({
      type: "comment",
      value: "CHAT_START",
    });

    const initialDocument = {
      ...this._chat.aila.document.content,
    };

    if (
      !initialDocument.title ||
      !initialDocument.subject ||
      !initialDocument.keyStage
    ) {
      throw new Error("title subject keyStage required");
    }

    // Create a stream handler
    const streamHandler = createInteractStreamHandler(
      this._chat,
      this._controller!,
    );

    // Call interact with the stream handler
    const interactResult = await interact({
      userId: this._chat.userId ?? "anonymous",
      chatId: this._chat.id,
      initialDocument: initialDocument,
      messageHistoryWithProtocol: this._chat.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => {
          log.info(m);
          return m;
        }) as { role: "user" | "assistant"; content: string }[],
      onUpdate: streamHandler, // This is the new part
      customAgents: {
        mathsStarterQuiz: async ({ document }) => {
          const quiz = await this._chat.fullQuizService.createBestQuiz(
            "/starterQuiz",
            document,
          );

          return quiz;
        },
        mathsExitQuiz: async ({ document }) => {
          const quiz = await this._chat.fullQuizService.createBestQuiz(
            "/exitQuiz",
            document,
          );

          return quiz;
        },
        fetchRagData: async ({ document }) => {
          if (this._chat.relevantLessons) {
            const results = await getRagLessonPlansByIds({
              lessonPlanIds: this._chat.relevantLessons.map(
                (lesson) => lesson.lessonPlanId,
              ),
            });
            return results;
          }
          const lessonPlanResults = await fetchRelevantLessonPlans({
            document,
          });

          const relevantLessons = lessonPlanResults.map((result) => ({
            lessonPlanId: result.ragLessonPlanId,
            title: result.lessonPlan.title,
          }));
          this._chat.relevantLessons = relevantLessons;

          return lessonPlanResults.map((l) => l.lessonPlan);
        },
      },
      relevantLessons: this._chat.relevantLessons,
    });

    // Stream the final result to the client
    await streamInteractResultToClient(
      this._chat,
      this._controller!,
      initialDocument,
      interactResult,
    );
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
}
