import type { PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";

import {
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_NUMBER_OF_RECORDS_IN_RAG,
} from "../constants";
import type { AilaAmericanismsFeature } from "../features/americanisms";
import { NullAilaAmericanisms } from "../features/americanisms/NullAilaAmericanisms";
import type { AilaSnapshotStore } from "../features/snapshotStore";
import type {
  AilaAnalyticsFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaPersistenceFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import { generateMessageId } from "../helpers/chat/generateMessageId";
import { AilaAuthenticationError, AilaGenerationError } from "./AilaError";
import { AilaFeatureFactory } from "./AilaFeatureFactory";
import type {
  AilaChatService,
  AilaDocumentService,
  AilaServices,
} from "./AilaServices";
import type { Message } from "./chat";
import { AilaChat } from "./chat";
import { createAilaDocument } from "./document/AilaDocumentFactory";
import { LessonPlanSchema } from "./document/schemas/lessonPlan";
import type { LLMService } from "./llm/LLMService";
import { OpenAIService } from "./llm/OpenAIService";
import type { AilaPlugin } from "./plugins/types";
import type {
  AilaGenerateDocumentOptions,
  AilaOptions,
  AilaOptionsWithDefaultFallbackValues,
  AilaInitializationOptions,
} from "./types";

const log = aiLogger("aila");
export class Aila implements AilaServices {
  private _initialised: boolean = false; // We have a separate flag for this because we have an async initialise method which cannot be called in the constructor
  private readonly _analytics?: AilaAnalyticsFeature;
  private readonly _chat: AilaChatService;
  private readonly _errorReporter?: AilaErrorReportingFeature;
  private _isShutdown: boolean = false;
  private readonly _document: AilaDocumentService;
  private readonly _chatLlmService: LLMService;
  private readonly _moderation?: AilaModerationFeature;
  private readonly _options: AilaOptionsWithDefaultFallbackValues;
  private readonly _snapshotStore: AilaSnapshotStore;
  private readonly _persistence: AilaPersistenceFeature[] = [];
  private readonly _threatDetection?: AilaThreatDetectionFeature;
  private readonly _prisma: PrismaClientWithAccelerate;
  private readonly _plugins: AilaPlugin[];
  private readonly _userId!: string | undefined;
  private readonly _chatId!: string;
  private readonly _americanisms: AilaAmericanismsFeature;

  constructor(options: AilaInitializationOptions) {
    this._userId = options.chat.userId;
    this._chatId = options.chat.id;
    this._options = this.initialiseOptions(options.options);

    this._chatLlmService =
      options.services?.chatLlmService ??
      new OpenAIService({ userId: this._userId, chatId: this._chatId });
    this._chat = new AilaChat({
      ...options.chat,
      aila: this,
      promptBuilder: options.promptBuilder,
      llmService: this._chatLlmService,
    });

    this._prisma = options.prisma ?? globalPrisma;

    this._document =
      options.services?.documentService ??
      createAilaDocument({
        aila: this,
        content: options.document?.content ?? {},
        plugin: options.document?.plugin,
        categorisationPlugin:
          options.document?.categorisationPlugin instanceof Function
            ? options.document.categorisationPlugin(this)
            : options.document?.categorisationPlugin,
        schema: options.document?.schema ?? LessonPlanSchema,
      });

    this._analytics = AilaFeatureFactory.createAnalytics(
      this,
      this._options,
      options.services?.analyticsAdapters?.(this),
    );
    this._moderation = AilaFeatureFactory.createModeration(
      this,
      this._options,
      options.services?.moderationAiClient,
    );
    this._snapshotStore = AilaFeatureFactory.createSnapshotStore(this);
    this._persistence = AilaFeatureFactory.createPersistence(
      this,
      this._options,
    );
    this._threatDetection = AilaFeatureFactory.createThreatDetection(
      this,
      this._options,
      options.services?.threatDetectors?.(this),
    );
    this._errorReporter = AilaFeatureFactory.createErrorReporter(
      this,
      this._options,
    );
    this._americanisms =
      options.services?.americanismsService?.(this) ??
      new NullAilaAmericanisms();

    if (this._analytics) {
      this._analytics.initialiseAnalyticsContext();
    }

    this._plugins = options.plugins;
  }

  private checkInitialised() {
    if (!this._initialised) {
      log.warn(
        "Aila instance has not been initialised. Please call the initialise method before using the instance.",
      );
      throw new Error("Aila instance has not been initialised.");
    }
  }

  // Initialization methods
  public async initialise() {
    if (this._initialised) {
      log.info("Aila - already initialised");
      return;
    }
    log.info("Aila - initialise");
    this.checkUserIdPresentIfPersisting();
    await this.loadChatIfPersisting();
    const persistedLessonPlan = this._chat.persistedChat?.lessonPlan;
    if (persistedLessonPlan) {
      this._document.content = persistedLessonPlan;
    }
    await this._document.initialiseContentFromMessages(this._chat.messages);

    this._initialised = true;
  }

  private initialiseOptions(
    options?: AilaOptions,
  ): AilaOptionsWithDefaultFallbackValues {
    return {
      mode: options?.mode ?? "interactive",
      model: options?.model ?? DEFAULT_MODEL,
      numberOfRecordsInRag:
        options?.numberOfRecordsInRag ?? DEFAULT_NUMBER_OF_RECORDS_IN_RAG,
      temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
      useAnalytics: options?.useAnalytics ?? true,
      useErrorReporting: options?.useErrorReporting ?? true,
      useModeration: options?.useModeration ?? true,
      usePersistence: options?.usePersistence ?? true,
      useRag: options?.useRag ?? true,
      useThreatDetection: options?.useThreatDetection ?? true,
    };
  }

  private async loadChatIfPersisting() {
    if (this._options.usePersistence) {
      await this._chat.loadChat({ store: "AilaPrismaPersistence" });
    }
  }

  // Getter methods
  public get chat(): AilaChatService {
    return this._chat;
  }

  public get document(): AilaDocumentService {
    return this._document;
  }

  public get snapshotStore() {
    return this._snapshotStore;
  }

  public get persistence() {
    return this._persistence;
  }

  public get moderation() {
    return this._moderation;
  }

  public get chatId() {
    return this._chatId;
  }

  public get userId() {
    return this._userId;
  }

  public get messages() {
    return this._chat.messages;
  }

  public get analytics() {
    return this._analytics;
  }

  public get options() {
    return this._options;
  }

  public get threatDetection() {
    return this._threatDetection;
  }

  public get errorReporter() {
    return this._errorReporter;
  }

  public get plugins() {
    return this._plugins;
  }

  public get chatLlmService() {
    return this._chatLlmService;
  }

  public get rag() {
    throw new Error("Attempting to use old, unused RAG service");
  }

  public get americanisms() {
    return this._americanisms;
  }

  public get prisma() {
    return this._prisma;
  }

  // Check methods
  public checkUserIdPresentIfPersisting() {
    if (!this._chat.userId && this._options.usePersistence) {
      throw new AilaAuthenticationError(
        "User ID not set, but usePersistence is enabled",
      );
    }
  }

  // Generation methods
  public async generateSync(opts: AilaGenerateDocumentOptions) {
    this.checkInitialised();
    const stream = await this.generate(opts);

    const reader = stream.getReader();

    try {
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  public async generate({
    input,
    abortController,
  }: AilaGenerateDocumentOptions) {
    this.checkInitialised();
    if (this._isShutdown) {
      throw new AilaGenerationError(
        "This Aila instance has been shut down and cannot be reused.",
      );
    }
    if (input) {
      log.info("Initiate chat with input", input);
      const message: Message = {
        id: generateMessageId({ role: "user" }),
        role: "user",
        content: input,
      };
      this._chat.addMessage(message);
    }

    await this.initialise();
    return this._chat.startStreaming(abortController);
  }

  // Shutdown method
  public async handleShutdown() {
    await this._analytics?.shutdown();
  }

  public async ensureShutdown() {
    if (!this._isShutdown) {
      await this.handleShutdown();
      this._isShutdown = true;
    }
  }
}
