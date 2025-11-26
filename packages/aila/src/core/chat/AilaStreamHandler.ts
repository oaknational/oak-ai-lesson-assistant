import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { RAG } from "@oakai/core/src/rag";
import { prisma as globalPrisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import {
  getRagLessonPlansByIds,
  getRelevantLessonPlans,
  parseKeyStagesForRagSearch,
  parseSubjectsForRagSearch,
} from "@oakai/rag";

import type { ReadableStreamDefaultController } from "stream/web";
import invariant from "tiny-invariant";
import z from "zod";

import { DEFAULT_NUMBER_OF_RECORDS_IN_RAG } from "../../constants";
import { AilaThreatDetectionError } from "../../features/threatDetection/types";
import { createOpenAIMessageToUserAgent } from "../../lib/agentic-system/agents/messageToUserAgent";
import { createOpenAIPlannerAgent } from "../../lib/agentic-system/agents/plannerAgent";
import { createSectionAgentRegistry } from "../../lib/agentic-system/agents/sectionAgents/sectionAgentRegistry";
import { ailaTurn } from "../../lib/agentic-system/ailaTurn";
import { createAilaTurnCallbacks } from "../../lib/agentic-system/compatibility/ailaTurnCallbacks";
import {
  createInteractStreamHandler,
  streamInteractResultToClient,
} from "../../lib/agents/compatibility/streamHandling";
import { interact } from "../../lib/agents/interact";
import { fetchRelevantLessonPlans } from "../../lib/agents/rag/fetchReleventLessons.agent";
import {
  type CompletedLessonPlan,
  CompletedLessonPlanSchemaWithoutLength,
} from "../../protocol/schema";
import { migrateLessonPlan } from "../../protocol/schemas/versioning/migrateLessonPlan";
import { extractPromptTextFromMessages } from "../../utils/extractPromptTextFromMessages";
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
      if (
        !this._chat.aila.options.useAgenticAila &&
        !this._chat.aila.options.useLegacyAgenticAila
      ) {
        await this.span("set-up-generation", async () => {
          await this._chat.setupGeneration();
        });
      } else {
        await this.span("initialise-chunks", async () => {
          this._chat.initialiseChunks();
        });
      }

      await this.span("check-threats", async () => {
        await this.checkForThreats();
      });

      if (this._chat.aila.options.useAgenticAila) {
        await this.span("start-agent-stream", async () => {
          await this.startAgentStream();
        });
      } else if (this._chat.aila.options.useLegacyAgenticAila) {
        await this.span("start-agent-stream-legacy", async () => {
          await this.startAgentStreamLegacy();
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
          await this.span("chat-completion", async () => {
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

  private async startAgentStreamLegacy() {
    await this._chat.enqueue({
      type: "comment",
      value: "CHAT_START",
    });

    const initialDocument = {
      ...this._chat.aila.document.content,
    };

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
            this._chat.relevantLessons ?? [],
          );

          return quiz;
        },
        mathsExitQuiz: async ({ document }) => {
          const quiz = await this._chat.fullQuizService.createBestQuiz(
            "/exitQuiz",
            document,
            this._chat.relevantLessons ?? [],
          );

          return quiz;
        },
        fetchRagData: async ({ document }): Promise<CompletedLessonPlan[]> => {
          const chatId = this._chat.id;
          const userId = this._chat.userId ?? undefined;
          const prisma = globalPrisma;
          const { subject, keyStage, topic, title } = document;
          invariant(title, "Document title is required to fetch RAG data");

          const isMaths = subject?.toLowerCase().startsWith("math") ?? false;

          if (!isMaths) {
            const rag = new RAG(prisma, { chatId, userId });
            const relevantLessonPlans = await rag.fetchLessonPlans({
              chatId: this._chat.id,
              title,
              keyStage,
              subject,
              topic: topic ?? undefined,
              k:
                this._chat.aila?.options.numberOfRecordsInRag ??
                DEFAULT_NUMBER_OF_RECORDS_IN_RAG,
            });

            const migratedLessonPlans: CompletedLessonPlan[] = [];

            for (const lessonPlan of relevantLessonPlans) {
              try {
                const result = await migrateLessonPlan({
                  lessonPlan: lessonPlan.content as Record<string, unknown>,
                  outputSchema: CompletedLessonPlanSchemaWithoutLength,
                  persistMigration: null,
                });
                migratedLessonPlans.push(result.lessonPlan);
              } catch (error) {
                log.error("Failed to migrate lesson plan", { error });
              }
            }

            this._chat.relevantLessons = relevantLessonPlans.map((lesson) => ({
              lessonPlanId: lesson.id,
              title: z.object({ title: z.string() }).parse(lesson.content)
                .title,
            }));

            return migratedLessonPlans;
          }

          if (this._chat.relevantLessons) {
            const results = await getRagLessonPlansByIds({
              lessonPlanIds: this._chat.relevantLessons.map(
                (lesson) => lesson.lessonPlanId,
              ),
            });
            return results.map((r) => r.lessonPlan);
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

  private async startAgentStream() {
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

    await ailaTurn({
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
                const quiz = await this._chat.fullQuizService.createBestQuiz(
                  "/starterQuiz",
                  ctx.currentTurn.document,
                );

                return { error: null, data: quiz };
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
                const quiz = await this._chat.fullQuizService.createBestQuiz(
                  "/exitQuiz",
                  ctx.currentTurn.document,
                );

                return { error: null, data: quiz };
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
