import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";
import type { getRagLessonPlansByIds } from "@oakai/rag";

import type { ReadableStreamDefaultController } from "stream/web";

import { getLastAssistantMessage } from "../../helpers/chat/getLastAssistantMessage";
import { resolveAgenticPromptIds } from "../../lib/agentic-system/agents/agenticPromptRegistry";
import { createOpenAIBritishEnglishCorrectorAgent } from "../../lib/agentic-system/agents/britishEnglishCorrectorAgent";
import type {
  GenerationCollector,
  PendingGeneration,
} from "../../lib/agentic-system/agents/executeGenericPromptAgent";
import { createOpenAIMessageToUserAgent } from "../../lib/agentic-system/agents/messageToUserAgent";
import { createOpenAIPlannerAgent } from "../../lib/agentic-system/agents/plannerAgent";
import { createSectionAgentRegistry } from "../../lib/agentic-system/agents/sectionAgents/sectionAgentRegistry";
import { ailaTurn } from "../../lib/agentic-system/ailaTurn";
import { createAilaTurnCallbacks } from "../../lib/agentic-system/compatibility/ailaTurnCallbacks";
import { wrapOpenAIWithFixture } from "../../lib/agentic-system/fixtures/FixtureOpenAIProxy";
import { deriveQuizBuildMode } from "../../lib/agentic-system/quizOperations/deriveQuizBuildMode";
import type {
  AilaTurnOutcome,
  SectionAgent,
} from "../../lib/agentic-system/types";
import type { LatestQuiz } from "../../protocol/schema";
import { extractPromptTextFromMessages } from "../../utils/extractPromptTextFromMessages";
import { handleThreatDetectionResult } from "../../utils/threatDetection/threatDetectionHandling";
import { AilaChatError } from "../AilaError";
import { ReportStorage, createQuizTracker } from "../quiz/reporting";
import type { AilaChat } from "./AilaChat";
import type { PatchEnqueuer } from "./PatchEnqueuer";
import { buildAgenticGenerationRows } from "./agenticGenerationPersistence";
import type { Message } from "./types";

const log = aiLogger("aila:stream");

type ThreatCheckOutcome =
  | { status: "safe" }
  | { status: "threat_detected"; threatDetection: ThreatDetectionResult }
  | { status: "check_failed"; error: Error; detectorName: string };

type StreamOutcome =
  | { status: "success" }
  | { status: "failed" }
  | { status: "aborted" }
  | { status: "threat_detected" }
  | { status: "threat_check_failed" };

type MathsQuizAgentHandler = SectionAgent<LatestQuiz>["handler"];
type MathsQuizAgentContext = Parameters<MathsQuizAgentHandler>[0];
type MathsQuizAgentResult = Awaited<ReturnType<MathsQuizAgentHandler>>;

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
  private _pendingGenerations: PendingGeneration[] = [];

  constructor(chat: AilaChat) {
    this._chat = chat;
    this._patchEnqueuer = chat.getPatchEnqueuer();
  }

  public startStreaming(abortController?: AbortController): ReadableStream {
    return new ReadableStream({
      start: (controller) => {
        this.stream(controller, abortController).catch((error) => {
          log.error("Error in stream:", error);
          try {
            controller.error(error);
          } catch (e) {
            if (
              e instanceof TypeError &&
              (e as NodeJS.ErrnoException).code === "ERR_INVALID_STATE"
            ) {
              log.info(
                "Controller already terminated before error could be signalled",
              );
            } else {
              throw e;
            }
          }
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

  private collectPendingGenerationData = (generation: PendingGeneration) => {
    this._pendingGenerations.push(generation);
  };

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
    let outcome: StreamOutcome = { status: "failed" };
    try {
      await this.setupStreamMode();

      await this.span("persist-chat-before-threat-check", async () => {
        await this._chat.persistChat();
      });

      const threatCheckOutcome = await this.span("check-threats", async () => {
        return await this.checkForThreats();
      });

      const threatOutcome =
        await this.handleThreatCheckOutcome(threatCheckOutcome);
      if (threatOutcome) {
        outcome = threatOutcome;
        return;
      }

      outcome = await this.runTurn(abortController);

      log.info(
        "Finished reading from stream",
        this._chat.iteration,
        this._chat.id,
      );
    } catch (e) {
      outcome = { status: "failed" };
      log.info("Caught error in stream", {
        error: e,
        type: e?.constructor?.name,
      });
      await this.handleStreamError(e);
    } finally {
      try {
        const status = this._chat.generation?.status;
        log.info("In finally block", {
          outcome,
          status,
          chatId: this._chat.id,
        });
        if (outcome.status === "success") {
          await this.completeChat();
        }
        await this.persistPendingGenerations();
      } finally {
        this.closeController();
        log.info("Stream closed", this._chat.iteration, this._chat.id);
      }
    }
  }

  private async setupStreamMode() {
    if (!this._chat.aila.options.useAgenticAila) {
      await this.span("set-up-generation", async () => {
        await this._chat.setupGeneration();
      });
      return;
    }

    await this.span("initialise-chunks", () => {
      this._chat.initialiseChunks();
      return Promise.resolve();
    });
  }

  private async handleThreatCheckOutcome(
    threatCheckOutcome: ThreatCheckOutcome,
  ): Promise<StreamOutcome | null> {
    if (threatCheckOutcome.status === "threat_detected") {
      await this.span("handle-threat-detected", async () => {
        await this.enqueueThreatResponse(threatCheckOutcome.threatDetection);
      });
      return { status: "threat_detected" };
    }

    if (threatCheckOutcome.status === "check_failed") {
      await this.span("handle-threat-check-failure", async () => {
        await this.handleThreatDetectionFailure(threatCheckOutcome);
      });
      return {
        status: "threat_check_failed",
      };
    }

    return null;
  }

  private async runTurn(
    abortController?: AbortController,
  ): Promise<StreamOutcome> {
    if (this._chat.aila.options.useAgenticAila) {
      return await this.runAgenticTurn();
    }

    return await this.runNonAgenticTurn(abortController);
  }

  private async runAgenticTurn(): Promise<StreamOutcome> {
    return await this.span("start-agent-stream", async () => {
      const agenticTurnOutcome = await this.startAgentStream();
      return agenticTurnOutcome.status === "success"
        ? { status: "success" }
        : { status: "failed" };
    });
  }

  private async runNonAgenticTurn(
    abortController?: AbortController,
  ): Promise<StreamOutcome> {
    await this.span("set-initial-state", async () => {
      await this._chat.handleSettingInitialState();
    });

    await this.span("handle-subject-warning", async () => {
      await this._chat.handleSubjectWarning();
    });
    await this.span("start-llm-stream", async () => {
      await this.startLLMStream();
    });
    return await this.span("read-from-stream", async () => {
      return await this.readFromStream(abortController);
    });
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

    let openai = createOpenAIClient({
      app: "lesson-assistant",
      chatMeta: {
        chatId: this._chat.id,
        userId: this._chat.userId,
      },
    });

    // Capture generations for persistence, except in fixture mode
    let collectGeneration: GenerationCollector | undefined =
      this.collectPendingGenerationData;

    const { agenticFixture } = this._chat.aila.options;
    if (agenticFixture) {
      log.info(
        "Wrapping OpenAI client with fixture proxy: mode=%s fixture=%s",
        agenticFixture.mode,
        agenticFixture.fixtureName,
      );
      openai = wrapOpenAIWithFixture(openai, agenticFixture);
      collectGeneration = undefined;
    } else {
      log.info("No agenticFixture config — using real OpenAI client");
    }

    const ailaTurnCallbacks = createAilaTurnCallbacks({
      chat: this._chat,
      controller: this._controller!,
      onRagFetchedChange: async (ragFetched) => {
        this._chat.ragFetched = ragFetched;
      },
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
        prisma: this._chat.aila.prisma,
      });
    }

    return await ailaTurn({
      callbacks: ailaTurnCallbacks,
      persistedState: {
        messages: extractPromptTextFromMessages(this._chat.messages),
        initialDocument,
        relevantLessons: relevantLessonsPopulated,
        ragFetched: this._chat.ragFetched,
      },
      runtime: {
        config: {
          mathsQuizEnabled: this._chat.aila.options.useMathsQuizRag ?? false,
        },
        plannerAgent: createOpenAIPlannerAgent(openai, collectGeneration),
        sectionAgents: createSectionAgentRegistry({
          openai,
          collectGeneration,
          customAgentHandlers: this.createMathsQuizAgentHandlers(),
        }),
        messageToUserAgent: createOpenAIMessageToUserAgent(
          openai,
          collectGeneration,
        ),
        britishEnglishCorrectorAgent: createOpenAIBritishEnglishCorrectorAgent(
          openai,
          collectGeneration,
        ),
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
            prisma: this._chat.aila.prisma,
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

  private async onStreamFailed(error: unknown) {
    try {
      if (this._chat.aila.options.useAgenticAila) {
        // ailaTurn threw rather than returning; its internal failure path never
        // completed, so the client has not received an error message.
        await this.enqueueGenericRetryError();
      } else if (this._chat.generation) {
        await this._chat.generationFailed(error);
      }
    } catch (recoveryError) {
      log.error("Error while handling stream failure", {
        error: recoveryError,
        originalError: error,
      });
      this._chat.aila.errorReporter?.reportError(recoveryError);
    }
  }

  private async completeChat() {
    try {
      await this.span("chat-completion", async () => {
        await this._chat.complete();
      });
      log.info("Chat completed", this._chat.iteration, this._chat.id);
    } catch (error) {
      log.error("Error in complete", error);
      this._chat.aila.errorReporter?.reportError(error);
      try {
        await this.enqueueGenericRetryError();
      } catch (enqueueError) {
        log.error("Error enqueueing completion failure message", {
          error: enqueueError,
          completionError: error,
        });
        this._chat.aila.errorReporter?.reportError(enqueueError);
      }
    }
  }

  private async enqueueGenericRetryError() {
    await this._chat.enqueue({
      type: "error",
      value: "Something went wrong. Please try sending your message again.",
    });
  }

  private async persistPendingGenerations() {
    if (this._pendingGenerations.length === 0) {
      return;
    }

    const userId = this._chat.userId;
    if (!userId) {
      log.info("No userId found for chat. Not persisting generations.");
      return;
    }

    try {
      const messageId = getLastAssistantMessage(this._chat.messages)?.id;
      const promptIdsByPromptTemplateId = await resolveAgenticPromptIds({
        prisma: this._chat.aila.prisma,
        promptTemplateIds: this._pendingGenerations.map(
          (generation) => generation.promptTemplateId,
        ),
      });
      const data = buildAgenticGenerationRows({
        pendingGenerations: this._pendingGenerations,
        promptIdsByPromptTemplateId,
        userId,
        appSessionId: this._chat.id,
        messageId,
      });

      await this._chat.aila.prisma.generation.createMany({ data });
      log.info("Persisted %d agentic generation(s)", data.length);
    } catch (e) {
      log.error("Error persisting generation data", e);
      this._chat.aila.errorReporter?.reportError(e);
    }
  }

  private createMathsQuizAgentHandlers(): {
    "starterQuiz--maths": MathsQuizAgentHandler;
    "exitQuiz--maths": MathsQuizAgentHandler;
  } {
    return {
      "starterQuiz--maths": async (ctx) =>
        await this.runMathsQuizAgent(
          ctx,
          "/starterQuiz",
          "starter quiz",
          "Failed to generate a starter quiz with maths quiz engine",
        ),
      "exitQuiz--maths": async (ctx) =>
        await this.runMathsQuizAgent(
          ctx,
          "/exitQuiz",
          "exit quiz",
          "Failed to generate an exit quiz with maths quiz engine",
        ),
    };
  }

  private async runMathsQuizAgent(
    ctx: MathsQuizAgentContext,
    quizPath: "/starterQuiz" | "/exitQuiz",
    quizName: string,
    failureMessage: string,
  ): Promise<MathsQuizAgentResult> {
    try {
      const userInstructions = ctx.currentTurn.currentStep?.sectionInstructions;
      const mode = deriveQuizBuildMode(ctx.currentTurn.currentStep);
      const tracker = createQuizTracker();
      const { quiz, note } = await tracker.run(async (task, reportId) => {
        const result = await this._chat.quizService.buildQuiz(
          quizPath,
          ctx.currentTurn.document,
          this._chat.relevantLessons ?? [],
          task,
          reportId,
          mode,
          userInstructions,
        );
        task.addData({ quiz: result.quiz, mode, userInstructions });
        return result;
      });
      await ReportStorage.store(tracker.getReport());

      return { error: null, data: quiz, note };
    } catch (error) {
      log.error(`Error generating ${quizName}`, { error });
      return {
        error: {
          message: failureMessage,
        },
      };
    }
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

  private async readFromStream(
    abortController?: AbortController,
  ): Promise<{ status: "success" | "aborted" }> {
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
      if (abortController?.signal.aborted) {
        log.info("Stream aborted", this._chat.iteration, this._chat.id);
        return { status: "aborted" };
      }
      return { status: "success" };
    } catch (e) {
      log.error("Error reading from stream", { error: e });
      if (abortController?.signal.aborted) {
        log.info("Stream aborted", this._chat.iteration, this._chat.id);
        return { status: "aborted" };
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
      prisma: this._chat.aila.prisma,
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
    await this.onStreamFailed(error);

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
