import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";
import type { getRagLessonPlansByIds } from "@oakai/rag";

import type { ReadableStreamDefaultController } from "stream/web";

import { createOpenAIMessageToUserAgent } from "../../lib/agentic-system/agents/messageToUserAgent";
import { createOpenAIPlannerAgent } from "../../lib/agentic-system/agents/plannerAgent";
import { createSectionAgentRegistry } from "../../lib/agentic-system/agents/sectionAgents/sectionAgentRegistry";
import { ailaTurn } from "../../lib/agentic-system/ailaTurn";
import { createAilaTurnCallbacks } from "../../lib/agentic-system/compatibility/ailaTurnCallbacks";
import type { AilaTurnOutcome } from "../../lib/agentic-system/types";
import { extractPromptTextFromMessages } from "../../utils/extractPromptTextFromMessages";
import { handleThreatDetectionResult } from "../../utils/threatDetection/threatDetectionHandling";
import { AilaChatError } from "../AilaError";
import { ReportStorage, createQuizTracker } from "../quiz/reporting";
import type { AilaChat } from "./AilaChat";
import type { PatchEnqueuer } from "./PatchEnqueuer";
import type { Message } from "./types";

const log = aiLogger("aila:stream");

function agenticTurnSucceeded(outcome: AilaTurnOutcome | null): boolean {
  return outcome?.status === "success";
}

type ThreatCheckOutcome =
  | { status: "safe" }
  | { status: "threat_detected"; threatDetection: ThreatDetectionResult }
  | { status: "check_failed"; error: Error; detectorName: string };

class ThreatDetectionFailureError extends Error {
  public readonly detectorName: string;

  constructor(detectorName: string, options?: ErrorOptions) {
    super(`Threat detection failed in ${detectorName}`, options);
    this.name = "ThreatDetectionFailureError";
    this.detectorName = detectorName;
  }
}

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

  private async span<T>(step: string, handler: () => Promise<T>): Promise<T> {
    return await this._chat.aila.tracing.span(
      step,
      { op: "aila.step" },
      handler,
    );
  }

  private threatDetectionMessages(): ThreatDetectionMessage[] {
    return this._chat.messages.filter(
      (m): m is Message & { role: "system" | "user" | "assistant" } =>
        m.role !== "data",
    );
  }

  private async checkForThreats(): Promise<ThreatCheckOutcome> {
    const messagesToCheck = this.threatDetectionMessages();
    const detectors = this._chat.aila.threatDetection?.detectors;
    if (!detectors) {
      log.info("No threat detectors configured");
      return { status: "safe" };
    }

    const lastMessage = messagesToCheck[messagesToCheck.length - 1];
    if (!lastMessage) {
      log.info("No messages to check for threats");
      return { status: "safe" };
    }
    for (const detector of detectors) {
      const detectorName = detector.constructor.name;
      log.info("Running detector", { detector: detectorName });
      let threatDetection: ThreatDetectionResult;
      try {
        threatDetection = await detector.detectThreat(messagesToCheck);
      } catch (error) {
        log.error("Threat detector failed", { detector: detectorName, error });
        return {
          status: "check_failed",
          error:
            error instanceof Error
              ? error
              : new Error("Unknown threat detector failure", { cause: error }),
          detectorName,
        };
      }
      if (threatDetection.isThreat) {
        log.info("Threat detected", { threatDetection });
        return { status: "threat_detected", threatDetection };
      }
    }
    log.info("Threat check complete - no threats found");
    return { status: "safe" };
  }

  private async stream(
    controller: ReadableStreamDefaultController,
    abortController?: AbortController,
  ) {
    log.info("Starting stream", { chatId: this._chat.id });
    this.setupController(controller);
    let agenticTurnOutcome: AilaTurnOutcome | null = null;
    let skipCompletion = false;
    try {
      if (!this._chat.aila.options.useAgenticAila) {
        await this.span("set-up-generation", async () => {
          await this._chat.setupGeneration();
        });
      } else {
        await this.span("initialise-chunks", () => {
          this._chat.initialiseChunks();
          return Promise.resolve();
        });
      }

      await this.span("persist-chat-before-threat-check", async () => {
        await this._chat.persistChat();
      });

      const threatCheckOutcome = await this.span("check-threats", async () => {
        return await this.checkForThreats();
      });

      if (threatCheckOutcome.status === "threat_detected") {
        skipCompletion = true;
        await this.span("handle-threat-detected", async () => {
          await this.enqueueThreatResponse(threatCheckOutcome.threatDetection);
        });
        return;
      }

      if (threatCheckOutcome.status === "check_failed") {
        skipCompletion = true;
        await this.span("handle-threat-check-failure", async () => {
          await this.handleThreatDetectionFailure(threatCheckOutcome);
        });
        return;
      }

      if (this._chat.aila.options.useAgenticAila) {
        await this.span("start-agent-stream", async () => {
          agenticTurnOutcome = await this.startAgentStream();
        });
      } else {
        await this.span("set-initial-state", async () => {
          await this._chat.handleSettingInitialState();
        });

        await this.span("handle-subject-warning", async () => {
          await this._chat.handleSubjectWarning();
        });
        await this.span("start-llm-stream", async () => {
          await this.startLLMStream();
        });
        await this.span("read-from-stream", async () => {
          await this.readFromStream(abortController);
        });
      }

      log.info(
        "Finished reading from stream",
        this._chat.iteration,
        this._chat.id,
      );
    } catch (e) {
      if (this._chat.aila.options.useAgenticAila) {
        agenticTurnOutcome = { status: "failed" };
      }
      log.info("Caught error in stream", {
        error: e,
        type: e?.constructor?.name,
      });
      await this.handleStreamError(e);
    } finally {
      const status = this._chat.generation?.status;
      const shouldComplete = this._chat.aila.options.useAgenticAila
        ? agenticTurnSucceeded(agenticTurnOutcome)
        : status !== "FAILED";
      log.info("In finally block", {
        status,
        agenticTurnOutcome,
        skipCompletion,
        chatId: this._chat.id,
      });
      if (shouldComplete && !skipCompletion) {
        try {
          await this.span("chat-completion", async () => {
            await this._chat.complete();
          });
          log.info("Chat completed", this._chat.iteration, this._chat.id);
        } catch (e) {
          log.error("Error in complete", e);
          this._chat.aila.errorReporter?.reportError(e);
          await this._chat.enqueue({
            type: "error",
            value:
              "Something went wrong. Please try sending your message again.",
          });
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

  private async startAgentStream(): Promise<AilaTurnOutcome> {
    await this._chat.enqueue({
      type: "comment",
      value: "CHAT_START",
    });

    const initialDocument = {
      ...this._chat.aila.document.content,
    };

    const openai = createOpenAIClient({
      app: "lesson-assistant",
      chatMeta: {
        chatId: this._chat.id,
        userId: this._chat.userId,
      },
    });

    const ailaTurnCallbacks = createAilaTurnCallbacks({
      chat: this._chat,
      controller: this._controller!,
    });

    let relevantLessonsPopulated: Awaited<
      ReturnType<typeof getRagLessonPlansByIds>
    > = [];
    if (this._chat.relevantLessons) {
      const { getRagLessonPlansByIds } = await import("@oakai/rag");
      relevantLessonsPopulated = await getRagLessonPlansByIds({
        lessonPlanIds: this._chat.relevantLessons.map(
          (lesson) => lesson.lessonPlanId,
        ),
      });
    }

    return await ailaTurn({
      callbacks: ailaTurnCallbacks,
      persistedState: {
        messages: extractPromptTextFromMessages(this._chat.messages),
        initialDocument,
        relevantLessons: relevantLessonsPopulated,
      },
      runtime: {
        config: {
          mathsQuizEnabled: true,
        },
        plannerAgent: createOpenAIPlannerAgent(openai),
        sectionAgents: createSectionAgentRegistry({
          openai,
          customAgentHandlers: {
            "starterQuiz--maths": async (ctx) => {
              try {
                const userInstructions =
                  ctx.currentTurn.currentStep?.sectionInstructions;
                const tracker = createQuizTracker();
                const { quiz, note } = await tracker.run(
                  async (task, reportId) => {
                    const result = await this._chat.quizService.buildQuiz(
                      "/starterQuiz",
                      ctx.currentTurn.document,
                      this._chat.relevantLessons ?? [],
                      task,
                      reportId,
                      userInstructions,
                    );
                    task.addData({ quiz: result.quiz, userInstructions });
                    return result;
                  },
                );
                await ReportStorage.store(tracker.getReport());

                return { error: null, data: quiz, note };
              } catch (error) {
                log.error("Error generating starter quiz", { error });
                return {
                  error: {
                    message:
                      "Failed to generate a starter quiz with maths quiz engine",
                  },
                };
              }
            },
            "exitQuiz--maths": async (ctx) => {
              try {
                const userInstructions =
                  ctx.currentTurn.currentStep?.sectionInstructions;
                const tracker = createQuizTracker();
                const { quiz, note } = await tracker.run(
                  async (task, reportId) => {
                    const result = await this._chat.quizService.buildQuiz(
                      "/exitQuiz",
                      ctx.currentTurn.document,
                      this._chat.relevantLessons ?? [],
                      task,
                      reportId,
                      userInstructions,
                    );
                    task.addData({ quiz: result.quiz, userInstructions });
                    return result;
                  },
                );
                await ReportStorage.store(tracker.getReport());

                return { error: null, data: quiz, note };
              } catch (error) {
                log.error("Error generating exit quiz", { error });
                return {
                  error: {
                    message:
                      "Failed to generate an exit quiz with maths quiz engine",
                  },
                };
              }
            },
          },
        }),
        messageToUserAgent: createOpenAIMessageToUserAgent(openai),
        fetchRelevantLessons: async ({ title, subject, keyStage }) => {
          const {
            getRelevantLessonPlans,
            parseKeyStagesForRagSearch,
            parseSubjectsForRagSearch,
          } = await import("@oakai/rag");
          const subjectSlugs = parseSubjectsForRagSearch(subject);
          const keyStageSlugs = parseKeyStagesForRagSearch(keyStage);
          const relevantLessons = await getRelevantLessonPlans({
            title,
            subjectSlugs,
            keyStageSlugs,
          });
          const persistedRelevantLessons = relevantLessons.map((result) => ({
            lessonPlanId: result.ragLessonPlanId,
            title: result.lessonPlan.title,
          }));
          this._chat.relevantLessons = persistedRelevantLessons;
          return relevantLessons;
        },
      },
    });
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
        const { done, value } = await this._streamReader.read();
        if (done) {
          log.info("Stream reading complete");
          break;
        }
        if (value) {
          this._chat.appendChunk(value);
          this._controller?.enqueue(value);
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

  private async enqueueThreatResponse(threatDetection: ThreatDetectionResult) {
    const response = await handleThreatDetectionResult({
      userId: this._chat.userId ?? "anonymous",
      chatId: this._chat.id,
      threatDetection,
      messages: this.threatDetectionMessages(),
    });
    await this._chat.enqueue(response);
  }

  private async handleThreatDetectionFailure(outcome: {
    error: Error;
    detectorName: string;
  }) {
    const error = new ThreatDetectionFailureError(outcome.detectorName, {
      cause: outcome.error,
    });
    this._chat.aila.errorReporter?.reportError(
      error,
      "Threat detection failed",
      "error",
    );
    await this._chat.enqueue({
      type: "error",
      value: "Threat detection failed",
      message:
        "I wasn't able to check your message for safety. Please try again in a moment.",
    });
  }

  private async handleStreamError(error: unknown) {
    for (const plugin of this._chat.aila.plugins ?? []) {
      await plugin.onStreamError?.(error, {
        aila: this._chat.aila,
        enqueue: this._chat.enqueue,
      });
    }

    if (error instanceof Error) {
      this._chat.aila.errorReporter?.reportError(error);
      throw new AilaChatError(error.message, { cause: error });
    } else {
      throw new AilaChatError("Unknown error", { cause: error });
    }
  }

  private closeController() {
    if (this._controller) {
      try {
        this._controller.close();
      } catch (e) {
        if (
          e instanceof TypeError &&
          (e as NodeJS.ErrnoException).code === "ERR_INVALID_STATE"
        ) {
          log.info(
            "Controller already terminated (closed or errored), skipping close",
          );
        } else {
          throw e;
        }
      }
    }
  }
}
