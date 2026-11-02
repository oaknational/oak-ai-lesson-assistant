import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { getRagLessonPlansByIds } from "@oakai/rag";

import OpenAI from "openai";

import type { ChatPersistencePayload } from "../features/persistence/AilaPersistence";
import { MockThreatDetector } from "../features/threatDetection/detectors/MockThreatDetector";
import { ailaTurn } from "../lib/agentic-system/ailaTurn";
import type { SectionKey } from "../lib/agentic-system/schema";
import type {
  JsonPatchDocumentOptional,
  ModerationDocument,
} from "../protocol/jsonPatchProtocol";
import type { PartialLessonPlan } from "../protocol/schema";
import * as threatDetectionHandling from "../utils/threatDetection/threatDetectionHandling";
import { Aila } from "./Aila";
import { AilaAuthenticationError } from "./AilaError";
import type { AilaChat } from "./chat/AilaChat";
import type { Message } from "./chat/types";
import { CircleTheoremLesson } from "./quiz/fixtures/CircleTheoremsExampleOutput";

jest.mock("../utils/threatDetection/threatDetectionHandling", () => ({
  handleThreatDetectionResult: jest.fn(),
}));

jest.mock("@oakai/core/src/llm/openai", () => ({
  ...jest.requireActual<object>("@oakai/core/src/llm/openai"),
  createOpenAIClient: jest.fn(),
}));

jest.mock("../lib/agentic-system/ailaTurn", () => ({
  ailaTurn: jest.fn(),
}));

jest.mock("@oakai/rag", () => ({
  getRagLessonPlansByIds: jest.fn(),
}));

describe("Aila", () => {
  describe("constructing", () => {
    it("should initialise Aila instance with persistence", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        document: {
          content: {},
        },
        chat: { id: "123", userId: "user123" },
        options: {
          useAnalytics: false,
          useModeration: false,
          usePersistence: true,
        },
        plugins: [],
      });

      expect(ailaInstance.persistence.length).toBeGreaterThan(0);
    });

    it("should initialize Aila instance with analytics", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        document: {
          content: {},
        },
        chat: { id: "123", userId: "user123" },
        options: {
          useAnalytics: true,
          useModeration: false,
          usePersistence: false,
        },
        plugins: [],
      });

      expect(ailaInstance.analytics).toBeDefined();
    });
  });

  describe("initialise", () => {
    it("should not set the initial title, subject and key stage when passed values for title, key stage and subject", async () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        document: {
          content: {
            title: "Roman Britain",
            subject: "history",
            keyStage: "key-stage-2",
          },
        },
        chat: { id: "123", userId: "user123" },
        options: {
          usePersistence: false,
          useAnalytics: false,
          useModeration: false,
          useThreatDetection: false,
          useErrorReporting: false,
        },
        plugins: [],
      });

      await ailaInstance.initialise();

      expect(ailaInstance.document.content.title).toBe("Roman Britain");
      expect(ailaInstance.document.content.subject).toBe("history");
      expect(ailaInstance.document.content.keyStage).toBe("key-stage-2");
    });

    // Calling initialise method successfully initializes the Aila instance
    it("should successfully initialize the Aila instance when calling the initialise method, and by default not set the lesson plan to initial values", async () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        document: {
          content: {},
        },
        chat: { id: "123", userId: "user123" },
        options: {
          useAnalytics: false,
          usePersistence: false,
          useModeration: false,
        },
        plugins: [],
      });

      await ailaInstance.initialise();

      expect(ailaInstance).toBeInstanceOf(Aila);
      expect(ailaInstance.document.content.title).not.toBeDefined();
      expect(ailaInstance.document.content.subject).not.toBeDefined();
      expect(ailaInstance.document.content.keyStage).not.toBeDefined();
    }, 10000);
  });

  describe("checkUserIdPresentIfPersisting", () => {
    // Throws AilaAuthenticationError when userId is not set and usePersistence is true
    it("should throw AilaAuthenticationError when userId is not set and usePersistence is true", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        chat: { id: "123", userId: undefined },
        options: { usePersistence: true, useAnalytics: false },
        plugins: [],
      });

      expect(ailaInstance.chatId).toBe("123");

      expect(() => {
        ailaInstance.checkUserIdPresentIfPersisting();
      }).toThrow(AilaAuthenticationError);
    });

    // userId is an empty string and usePersistence is true
    it("should throw AilaAuthenticationError when userId is an empty string and usePersistence is true", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        chat: { id: "123", userId: "" },
        options: { usePersistence: true, useAnalytics: false },
        plugins: [],
      });

      expect(() => {
        ailaInstance.checkUserIdPresentIfPersisting();
      }).toThrow(AilaAuthenticationError);
    });

    // userId is an empty string and usePersistence is true
    it("should not throw AilaAuthenticationError when userId is not set and usePersistence is false", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        chat: { id: "123", userId: "" },
        options: { usePersistence: false, useAnalytics: false },
        plugins: [],
      });
      expect(() => {
        ailaInstance.checkUserIdPresentIfPersisting();
      }).not.toThrow(AilaAuthenticationError);
    });

    // Throws AilaAuthenticationError when userId is an empty string and usePersistence is true
    it("should throw AilaAuthenticationError when userId is an empty string and usePersistence is true", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        chat: { id: "123", userId: "" },
        options: { usePersistence: true, useAnalytics: false },
        plugins: [],
      });

      expect(() => {
        ailaInstance.checkUserIdPresentIfPersisting();
      }).toThrow(AilaAuthenticationError);
    });

    // Does not throw AilaAuthenticationError when userId is not set and usePersistence is false
    it("should not throw AilaAuthenticationError when userId is not set and usePersistence is false", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        chat: { id: "123", userId: undefined },
        options: { usePersistence: false, useAnalytics: false },
        plugins: [],
      });

      expect(() => {
        ailaInstance.checkUserIdPresentIfPersisting();
      }).not.toThrow(AilaAuthenticationError);
    });

    // Throws AilaAuthenticationError when userId is an empty string and usePersistence is true
    it("should throw AilaAuthenticationError when userId is an empty string and usePersistence is true", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        chat: { id: "123", userId: "" },
        options: { usePersistence: true, useAnalytics: false },
        plugins: [],
      });

      expect(() => {
        ailaInstance.checkUserIdPresentIfPersisting();
      }).toThrow(AilaAuthenticationError);
    });

    // Does not throw AilaAuthenticationError when userId is not set and usePersistence is false
    it("should not throw AilaAuthenticationError when userId is not set and usePersistence is false", () => {
      const ailaInstance = new Aila({
        prisma: {} as never,
        chat: { id: "123", userId: undefined },
        options: { usePersistence: false, useAnalytics: false },
        plugins: [],
      });

      expect(() => {
        ailaInstance.checkUserIdPresentIfPersisting();
      }).not.toThrow(AilaAuthenticationError);
    });
  });

  describe("agentic threat detection", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("handles a threat before generation is initialised", async () => {
      const handledThreatMessage = {
        type: "error" as const,
        value: "Threat detected",
        message: "Threat was detected",
      };

      const handleThreatDetectionResultSpy = jest
        .spyOn(threatDetectionHandling, "handleThreatDetectionResult")
        .mockResolvedValue(handledThreatMessage);
      const prisma = {} as never;

      const ailaInstance = new Aila({
        prisma,
        document: {
          content: {},
        },
        chat: { id: "123", userId: "user123" },
        options: {
          usePersistence: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
        services: {
          threatDetectors: () => [new MockThreatDetector({ response: true })],
        },
      });

      await ailaInstance.initialise();

      const enqueueSpy = jest
        .spyOn(ailaInstance.chat as AilaChat, "enqueue")
        .mockResolvedValue(undefined);

      const stream = await ailaInstance.generate({
        input: "Trigger threat detection",
      });
      const reader = stream.getReader();

      await expect(reader.read()).resolves.toEqual({
        done: true,
        value: undefined,
      });

      expect(handleThreatDetectionResultSpy).toHaveBeenCalledWith({
        userId: "user123",
        chatId: "123",
        threatDetection: expect.objectContaining({
          provider: "mock",
          isThreat: true,
          message: "Mocked response",
        }),
        messages: ailaInstance.chat.messages,
        prisma,
      });
      expect(enqueueSpy).toHaveBeenCalledWith(handledThreatMessage);
    });
  });

  describe("agentic completion", () => {
    const userId = "user123";

    /**
     * Stands in for ailaTurn with the callback sequence a real turn produces:
     * the planner opens the message, each section emits a patch, and the
     * final document is the starting document with those edits applied
     */
    const mockTurnEditingSections = (edits: PartialLessonPlan) => {
      jest
        .mocked(ailaTurn)
        .mockImplementation(async ({ persistedState, callbacks }) => {
          const { initialDocument } = persistedState;
          const sectionKeys = Object.keys(edits) as SectionKey[];
          callbacks.onPlannerComplete({ sectionKeys });
          callbacks.onSectionComplete(
            sectionKeys.map((key) => ({
              op: key in initialDocument ? "replace" : "add",
              path: `/${key}`,
              value: edits[key],
            })),
          );
          await callbacks.onTurnComplete({
            stepsExecuted: sectionKeys.map((sectionKey) => ({
              type: "section",
              sectionKey,
              action: "generate",
              sectionInstructions: null,
            })),
            document: { ...initialDocument, ...edits },
            ailaMessage: "I've updated the lesson.",
          });
          return {
            status: "success",
            correctorStats: { attempted: [], notNeeded: [], failed: [] },
          };
        });
    };

    const createChatPrisma = (output?: unknown) => ({
      appSession: {
        findFirst: jest
          .fn()
          .mockResolvedValue(
            output ? { id: "chat_saved", userId, output } : null,
          ),
        update: jest.fn().mockResolvedValue({}),
        upsert: jest.fn().mockResolvedValue({}),
      },
      lessonSchema: {
        findFirst: jest.fn().mockResolvedValue({ id: "lesson_schema_1" }),
        create: jest.fn(),
      },
      lessonSnapshot: {
        create: jest.fn().mockResolvedValue({ id: "lesson_snapshot_1" }),
      },
    });

    const finalStreamedState = (enqueueSpy: jest.SpyInstance) =>
      enqueueSpy.mock.calls
        .map(([message]: [JsonPatchDocumentOptional]) => message)
        .find((message) => message.type === "state");

    beforeEach(() => {
      // resetMocks clears factory implementations, so set them here
      jest
        .mocked(createOpenAIClient)
        .mockImplementation(() => new OpenAI({ apiKey: "test" }));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("applies the turn's patches, saves a snapshot and moderates before completing", async () => {
      const newTitle = "The Fall of the Roman Empire in Britain";
      mockTurnEditingSections({ title: newTitle });
      const prisma = createChatPrisma();
      const ailaInstance = new Aila({
        prisma: prisma as never,
        document: {
          content: {
            title: "Roman Britain",
            subject: "history",
            keyStage: "key-stage-2",
          },
        },
        chat: { id: "123", userId },
        options: {
          usePersistence: false,
          useAnalytics: false,
          useModeration: false,
          useThreatDetection: false,
          useErrorReporting: false,
        },
        plugins: [],
      });
      await ailaInstance.initialise();

      // Moderators need external services, so stand in for the feature here.
      // Its own behaviour is covered in features/moderation.
      const moderationMessage: ModerationDocument = {
        type: "moderation",
        id: "moderation_1",
        categories: [],
      };
      const moderate = jest.fn().mockResolvedValue(moderationMessage);
      const options = { ...ailaInstance.options, useModeration: true };
      jest.spyOn(ailaInstance, "options", "get").mockReturnValue(options);
      jest
        .spyOn(ailaInstance, "moderation", "get")
        .mockReturnValue({ moderate });
      const chat = ailaInstance.chat as AilaChat;
      const enqueueSpy = jest.spyOn(chat, "enqueue");

      await ailaInstance.generateSync({
        input: "Make the title more specific",
      });

      const expectedLesson = {
        title: newTitle,
        subject: "history",
        keyStage: "key-stage-2",
      };
      const assistantMessage = ailaInstance.messages.at(-1);
      expect(assistantMessage?.role).toBe("assistant");

      // The client, the server document and the snapshot agree
      expect(finalStreamedState(enqueueSpy)).toMatchObject({
        value: expectedLesson,
      });
      expect(ailaInstance.document.content).toEqual(expectedLesson);
      expect(prisma.lessonSnapshot.create).toHaveBeenCalledTimes(1);
      expect(prisma.lessonSnapshot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          lessonJson: expectedLesson,
          messageId: assistantMessage?.id,
        }),
      });
      expect(moderate).toHaveBeenCalledWith(
        expect.objectContaining({ content: expectedLesson }),
      );

      const enqueued = enqueueSpy.mock.calls.map(
        ([message]: [JsonPatchDocumentOptional]) =>
          message.type === "comment" ? message.value : message.type,
      );
      const order = [
        "CHAT_START",
        "state",
        "id",
        "MODERATION_START",
        "MODERATING",
        "moderation",
        "CHAT_COMPLETE",
      ].map((event) => enqueued.indexOf(event));
      expect(order).not.toContain(-1);
      expect(order).toEqual([...order].sort((a, b) => a - b));
      expect(enqueued.at(-1)).toBe("CHAT_COMPLETE");
    });

    it("keeps a saved chat intact through an agentic edit and a reload", async () => {
      // A saved chat with every lesson section (including basedOn), message
      // history, sharing and RAG state.
      const savedMessages: Message[] = [
        {
          id: "u-1",
          role: "user",
          content: "Create a KS4 maths lesson on circle theorems",
        },
        {
          id: "a-1",
          role: "assistant",
          content: JSON.stringify({
            type: "llmMessage",
            sectionsToEdit: [],
            patches: [],
            sectionsEdited: [],
            prompt: { type: "text", value: "Here's your lesson plan." },
            status: "complete",
          }),
        },
      ];
      const savedChat = {
        id: "chat_saved",
        path: "/aila/chat_saved",
        title: CircleTheoremLesson.title,
        subject: CircleTheoremLesson.subject,
        keyStage: CircleTheoremLesson.keyStage,
        topic: CircleTheoremLesson.topic,
        userId,
        createdAt: 1767225600000,
        updatedAt: 1767312000000,
        iteration: 3,
        isShared: true,
        relevantLessons: [
          { lessonPlanId: "rag_lesson_1", title: "Angles in a circle" },
        ],
        ragFetched: {
          status: "selected" as const,
          searchIdentity: {
            title: "Circle Theorems",
            subject: "maths",
            keyStage: "key-stage-4",
          },
        },
        lessonPlan: CircleTheoremLesson,
        messages: savedMessages,
      };
      const newOutcome =
        "I can prove and apply the angle at the centre theorem.";
      const input = "Make the learning outcome more specific";
      mockTurnEditingSections({ learningOutcome: newOutcome });
      const ragLessonPlans = [
        { ragLessonPlanId: "rag_lesson_1", lessonPlan: CircleTheoremLesson },
      ];
      jest
        .mocked(getRagLessonPlansByIds)
        .mockResolvedValue(ragLessonPlans as never);

      // Messages are passed in as the chat handler does, from the stored chat
      const createAila = (
        prisma: ReturnType<typeof createChatPrisma>,
        messages: Message[],
      ) =>
        new Aila({
          prisma: prisma as never,
          chat: { id: savedChat.id, userId, messages: [...messages] },
          options: {
            usePersistence: true,
            useAnalytics: false,
            useModeration: false,
            useThreatDetection: false,
            useErrorReporting: false,
          },
          plugins: [],
        });

      const prisma = createChatPrisma(savedChat);
      const ailaInstance = createAila(prisma, savedMessages);
      await ailaInstance.initialise();
      await ailaInstance.generateSync({ input });

      // The turn starts from the saved lesson and its relevant lessons
      const { persistedState } = jest.mocked(ailaTurn).mock.calls[0]![0];
      expect(getRagLessonPlansByIds).toHaveBeenCalledWith(
        expect.objectContaining({ lessonPlanIds: ["rag_lesson_1"] }),
      );
      expect(persistedState.relevantLessons).toEqual(ragLessonPlans);
      expect(persistedState.ragFetched).toEqual(savedChat.ragFetched);

      expect(persistedState.initialDocument).toEqual(savedChat.lessonPlan);
      expect(prisma.appSession.update).not.toHaveBeenCalled();

      // The save keeps everything except the intended edit.
      // `options` isn't asserted: it holds the current Aila options and isn't
      // read back. Fields outside the save payload, such as `startingMessage`
      // on some older chats, are already dropped on save.
      const [upsert] = prisma.appSession.upsert.mock.calls.at(-1) as [
        {
          where: { id: string; userId: string };
          create: { output: ChatPersistencePayload };
          update: { output: ChatPersistencePayload };
        },
      ];
      expect(upsert.where).toEqual({ id: savedChat.id, userId });
      const saved = upsert.update.output;
      expect(upsert.create.output).toEqual(saved);
      expect(saved.lessonPlan).toEqual({
        ...savedChat.lessonPlan,
        learningOutcome: newOutcome,
      });
      expect(saved).toMatchObject({
        id: savedChat.id,
        userId,
        path: savedChat.path,
        title: savedChat.title,
        subject: savedChat.subject,
        keyStage: savedChat.keyStage,
        topic: savedChat.topic,
        createdAt: savedChat.createdAt,
        iteration: savedChat.iteration + 1,
        isShared: true,
        relevantLessons: savedChat.relevantLessons,
        ragFetched: savedChat.ragFetched,
      });
      expect(saved.messages).toHaveLength(4);
      expect(saved.messages.slice(0, 2)).toEqual(savedMessages);
      expect(saved.messages[2]).toMatchObject({ role: "user", content: input });
      const assistantMessage = saved.messages[3];
      expect(assistantMessage?.role).toBe("assistant");

      expect(prisma.lessonSnapshot.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          chatId: savedChat.id,
          messageId: assistantMessage?.id,
          lessonJson: saved.lessonPlan,
        }),
      });

      // Reloading the saved chat gives back the same lesson and metadata
      const reloadPrisma = createChatPrisma(saved);
      const reloaded = createAila(reloadPrisma, saved.messages);
      await reloaded.initialise();
      const reloadedChat = reloaded.chat as AilaChat;

      expect(reloadPrisma.appSession.update).not.toHaveBeenCalled();
      expect(reloaded.document.content).toEqual(saved.lessonPlan);
      expect(reloadedChat.isShared).toBe(true);
      expect(reloadedChat.relevantLessons).toEqual(savedChat.relevantLessons);
      expect(reloadedChat.ragFetched).toEqual(savedChat.ragFetched);
      expect(reloadedChat.iteration).toBe(saved.iteration);
      expect(reloadedChat.persistedChat?.messages).toEqual(saved.messages);
      expect(reloaded.messages).toEqual(saved.messages);
    });
  });

  describe("shutdown", () => {
    // This is so that analytics can be flushed before the process exits.
    // Posthog requires calling shutdown only once per client instance.
    it("should only call shutdown once", async () => {
      const shutdownMock = jest.fn();
      const ailaInstance = new Aila({
        prisma: {} as never,
        plugins: [],
        chat: {
          id: "chat_1",
          userId: undefined,
        },
      });
      ailaInstance.handleShutdown = shutdownMock;
      await ailaInstance.ensureShutdown();
      expect(shutdownMock).toHaveBeenCalled();
      await ailaInstance.ensureShutdown();
      expect(shutdownMock).toHaveBeenCalledTimes(1);
    });
  });
});
