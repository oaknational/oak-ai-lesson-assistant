import { PrismaClientWithAccelerate, prisma as globalPrisma } from "@oakai/db";

import {
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_RAG_LESSON_PLANS,
} from "../constants";
import { AilaCategorisation } from "../features/categorisation";
import {
  AilaAnalyticsFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaPersistenceFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import { generateMessageId } from "../helpers/chat/generateMessageId";
import { AilaAuthenticationError, AilaGenerationError } from "./AilaError";
import { AilaFeatureFactory } from "./AilaFeatureFactory";
import {
  AilaChatService,
  AilaLessonService,
  AilaServices,
} from "./AilaServices";
import { AilaChat, Message } from "./chat";
import { AilaLesson } from "./lesson";
import { LLMService } from "./llm/LLMService";
import { OpenAIService } from "./llm/OpenAIService";
import { AilaPlugin } from "./plugins/types";
import {
  AilaGenerateLessonPlanOptions,
  AilaOptions,
  AilaOptionsWithDefaultFallbackValues,
  AilaInitializationOptions,
} from "./types";

export class Aila implements AilaServices {
  private _analytics?: AilaAnalyticsFeature;
  private _chat: AilaChatService;
  private _errorReporter?: AilaErrorReportingFeature;
  private _isShutdown: boolean = false;
  private _lesson: AilaLessonService;
  private _chatLlmService: LLMService;
  private _moderation?: AilaModerationFeature;
  private _options: AilaOptionsWithDefaultFallbackValues;
  private _persistence: AilaPersistenceFeature[] = [];
  private _threatDetection?: AilaThreatDetectionFeature;
  private _prisma: PrismaClientWithAccelerate;
  private _plugins: AilaPlugin[];
  private _userId!: string | undefined;
  private _chatId!: string;

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

    this._lesson = new AilaLesson({
      aila: this,
      lessonPlan: options.lessonPlan ?? {},
      categoriser:
        options.services?.chatCategoriser ??
        new AilaCategorisation({
          aila: this,
          prisma: this._prisma,
          chatId: this._chatId,
          userId: this._userId,
        }),
    });

    this._analytics = AilaFeatureFactory.createAnalytics(this, this._options);
    this._moderation = AilaFeatureFactory.createModeration(this, this._options);
    this._persistence = AilaFeatureFactory.createPersistence(
      this,
      this._options,
    );
    this._threatDetection = AilaFeatureFactory.createThreatDetection(
      this,
      this._options,
    );
    this._errorReporter = AilaFeatureFactory.createErrorReporter(
      this,
      this._options,
    );

    if (this._analytics) {
      this._analytics.initialiseAnalyticsContext();
    }

    this._plugins = options.plugins;
  }

  // Initialization methods
  public async initialise() {
    this.checkUserIdPresentIfPersisting();
    await this.loadChatIfPersisting();
    await this._lesson.setUpInitialLessonPlan(this._chat.messages);
  }

  private initialiseOptions(options?: AilaOptions) {
    return {
      useRag: options?.useRag ?? true,
      temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
      // #TODO we should find a way to make this less specifically tied
      // to lesson RAG
      numberOfLessonPlansInRag:
        options?.numberOfLessonPlansInRag ?? DEFAULT_RAG_LESSON_PLANS,
      usePersistence: options?.usePersistence ?? true,
      useAnalytics: options?.useAnalytics ?? true,
      useModeration: options?.useModeration ?? true,
      useThreatDetection: options?.useThreatDetection ?? true,
      useErrorReporting: options?.useErrorReporting ?? true,
      model: options?.model ?? DEFAULT_MODEL,
      mode: options?.mode ?? "full",
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

  // #TODO we should refactor this to be a document
  // and not be specifically tied to a "lesson"
  // so that we can handle any type of generation
  public get lesson(): AilaLessonService {
    return this._lesson;
  }

  // #TODO we should not need this
  public get lessonPlan() {
    return this._lesson.plan;
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

  // Check methods
  public checkUserIdPresentIfPersisting() {
    if (!this._chat.userId && this._options.usePersistence) {
      throw new AilaAuthenticationError(
        "User ID not set, but usePersistence is enabled",
      );
    }
  }

  // Generation methods
  public async generateSync(opts: AilaGenerateLessonPlanOptions) {
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

  // #TODO this method should not accept these keys so
  // that the Aila class does not need to know about the shape
  // of the data that it is handling - this will enable us to use
  // the same logic for any type of content generation
  public async generate({
    input,
    title,
    subject,
    keyStage,
    topic,
  }: AilaGenerateLessonPlanOptions) {
    if (this._isShutdown) {
      throw new AilaGenerationError(
        "This Aila instance has been shut down and cannot be reused.",
      );
    }
    if (input) {
      const message: Message = {
        id: generateMessageId({ role: "user" }),
        role: "user",
        content: input,
      };
      this._chat.addMessage(message);
    }
    if (title) {
      this._lesson.plan.title = title;
    }
    if (subject) {
      this._lesson.plan.subject = subject;
    }
    if (keyStage) {
      this._lesson.plan.keyStage = keyStage;
    }
    if (topic) {
      this._lesson.plan.topic = topic;
    }
    await this.initialise();
    return this._chat.startStreaming();
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
