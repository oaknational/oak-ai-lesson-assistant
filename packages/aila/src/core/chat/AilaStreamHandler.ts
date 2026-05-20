import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";
import {
  getRagLessonPlansByIds,
  getRelevantLessonPlans,
  parseKeyStagesForRagSearch,
  parseSubjectsForRagSearch,
} from "@oakai/rag";

import type { ReadableStreamDefaultController } from "stream/web";

import { AilaThreatDetectionError } from "../../features/threatDetection/types";
import { createOpenAIBritishEnglishCorrectorAgent } from "../../lib/agentic-system/agents/britishEnglishCorrectorAgent";
import { createOpenAIMessageToUserAgent } from "../../lib/agentic-system/agents/messageToUserAgent";
import { createOpenAIPlannerAgent } from "../../lib/agentic-system/agents/plannerAgent";
import { createSectionAgentRegistry } from "../../lib/agentic-system/agents/sectionAgents/sectionAgentRegistry";
import { ailaTurn } from "../../lib/agentic-system/ailaTurn";
import { createAilaTurnCallbacks } from "../../lib/agentic-system/compatibility/ailaTurnCallbacks";
import type { AilaTurnOutcome } from "../../lib/agentic-system/types";
import { extractPromptTextFromMessages } from "../../utils/extractPromptTextFromMessages";
import { AilaChatError } from "../AilaError";
import { ReportStorage, createQuizTracker } from "../quiz/reporting";
import type { AilaChat } from "./AilaChat";
import type { PatchEnqueuer } from "./PatchEnqueuer";

const log = aiLogger("aila:stream");

function agenticTurnSucceeded(
  status: AilaTurnOutcome["status"] | null,
): boolean {
  return status === "success";
}

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

  private async span(step: string, handler: () => Promise<void>) {
    await this._chat.aila.tracing.span(step, { op: "aila.step" }, handler);
  }

  private async checkForThreats(
    messages?: {
      role: "system" | "assistant" | "user" | "data";
      content: string;
    }[],
  ) {
    const messagesToCheck = (messages ?? this._chat.messages).filter(
      (message): message is ThreatDetectionMessage => message.role !== "data",
    );
    if (!this._chat.aila.threatDetection?.detectors) {
      log.info("No threat detectors configured");
      return;
    }

    const lastMessage = messagesToCheck[messagesToCheck.length - 1];
    if (!lastMessage) {
      log.info("No messages to check for threats");
      return;
    }

    const detectors = this._chat.aila.threatDetection?.detectors ?? [];
    for (const detector of detectors) {
      const detectorName = detector.constructor.name;
      log.info("Running detector", { detector: detectorName });
      let threatDetection: ThreatDetectionResult;
      try {
        threatDetection = await detector.detectThreat(messagesToCheck);
      } catch (error) {
        log.error("Threat detector failed", { detector: detectorName, error });
        throw new ThreatDetectionFailureError(detectorName, { cause: error });
      }
      if (threatDetection.isThreat) {
        log.info("Threat detected", { threatDetection });
        throw new AilaThreatDetectionError(
          this._chat.userId ?? "unknown",
          "Potential threat detected",
          threatDetection,
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
    let agenticTurnStatus: AilaTurnOutcome["status"] | null = null;
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

      await this.span("check-threats", async () => {
        await this.checkForThreats();
      });

      if (this._chat.aila.options.useAgenticAila) {
        await this.span("start-agent-stream", async () => {
          const outcome = await this.startAgentStream();
          agenticTurnStatus = outcome.status;
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
        agenticTurnStatus = "failed";
      }
      log.info("Caught error in stream", {
        error: e,
        type: e?.constructor?.name,
      });
      if (e instanceof AilaThreatDetectionError) {
        await this.handleThreatDetected(e);
        skipCompletion = true;
        return;
      }
      if (e instanceof ThreatDetectionFailureError) {
        await this.handleThreatDetectionFailure(e);
        skipCompletion = true;
        return;
      }
      try {
        await this.handleStreamError(e);
      } catch (streamError) {
        if (streamError instanceof AilaThreatDetectionError) {
          await this.handleThreatDetected(streamError);
          skipCompletion = true;
          return;
        }

        throw streamError;
      }
    } finally {
      const status = this._chat.generation?.status;
      const shouldComplete = this._chat.aila.options.useAgenticAila
        ? agenticTurnSucceeded(agenticTurnStatus)
        : status !== "FAILED";
      log.info("In finally block", {
        status,
        agenticTurnStatus,
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

    const relevantLessonsPopulated = this._chat.relevantLessons
      ? await getRagLessonPlansByIds({
          lessonPlanIds: this._chat.relevantLessons.map(
            (lesson) => lesson.lessonPlanId,
          ),
        })
      : [];

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
        britishEnglishCorrectorAgent:
          createOpenAIBritishEnglishCorrectorAgent(openai),
        fetchRelevantLessons: async ({ title, subject, keyStage }) => {
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

  private async handleThreatDetected(error: AilaThreatDetectionError) {
    log.info("Handling threat detection error");
    await this._chat.generationFailed(error);
  }

  private async handleThreatDetectionFailure(
    error: ThreatDetectionFailureError,
  ) {
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

  private isThreatDetectionProviderError(error: Error): boolean {
    const detectors = this._chat.aila.threatDetection?.detectors ?? [];
    return detectors.some((detector) => detector.isThreatError(error));
  }

  private async handleStreamError(error: unknown) {
    if (error instanceof Error) {
      if (error instanceof AilaThreatDetectionError) {
        throw error;
      }

      if (this.isThreatDetectionProviderError(error)) {
        throw new AilaThreatDetectionError(
          this._chat.userId ?? "unknown",
          "Threat detected",
          undefined,
          { cause: error },
        );
      }
    }

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
