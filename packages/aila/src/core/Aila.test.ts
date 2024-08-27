import { Aila } from ".";
import { MockLLMService } from "../../tests/mocks/MockLLMService";
import { setupPolly } from "../../tests/mocks/setupPolly";
import { AilaAuthenticationError } from "./AilaError";

describe("Aila", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let polly: any;

  beforeAll(() => {
    polly = setupPolly();
  });

  afterAll(async () => {
    await polly.stop();
  });

  describe("constructing", () => {
    it("should initialise Aila instance with persistence", () => {
      const ailaInstance = new Aila({
        lessonPlan: {},
        chat: { id: "123", userId: "user123" },
        options: {
          useAnalytics: false,
          useModeration: false,
          usePersistence: true,
          useRag: false,
        },
        plugins: [],
      });

      expect(ailaInstance.persistence.length).toBeGreaterThan(0);
    });

    it("should initialize Aila instance with analytics", () => {
      const ailaInstance = new Aila({
        lessonPlan: {},
        chat: { id: "123", userId: "user123" },
        options: {
          useAnalytics: true,
          useModeration: false,
          usePersistence: false,
          useRag: false,
        },
        plugins: [],
      });

      expect(ailaInstance.analytics).toBeDefined();
    });
  });

  describe("initialise", () => {
    it("should not set the initial title, subject and key stage when passed values for title, key stage and subject", async () => {
      const ailaInstance = new Aila({
        lessonPlan: {
          title: "Roman Britain",
          subject: "history",
          keyStage: "key-stage-2",
        },
        chat: { id: "123", userId: "user123" },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
      });

      await ailaInstance.initialise();

      expect(ailaInstance.lesson.plan.title).toBe("Roman Britain");
      expect(ailaInstance.lesson.plan.subject).toBe("history");
      expect(ailaInstance.lesson.plan.keyStage).toBe("key-stage-2");
    });

    // Calling initialise method successfully initializes the Aila instance
    it("should successfully initialize the Aila instance when calling the initialise method, and by default not set the lesson plan to initial values", async () => {
      const ailaInstance = new Aila({
        lessonPlan: {},
        chat: { id: "123", userId: "user123" },
        options: {
          useAnalytics: false,
          usePersistence: false,
          useModeration: false,
          useRag: false,
        },
        plugins: [],
      });

      await ailaInstance.initialise();

      expect(ailaInstance).toBeInstanceOf(Aila);
      expect(ailaInstance.lesson.plan.title).not.toBeDefined();
      expect(ailaInstance.lesson.plan.subject).not.toBeDefined();
      expect(ailaInstance.lesson.plan.keyStage).not.toBeDefined();
    }, 10000);
  });

  describe("checkUserIdPresentIfPersisting", () => {
    // Throws AilaAuthenticationError when userId is not set and usePersistence is true
    it("should throw AilaAuthenticationError when userId is not set and usePersistence is true", () => {
      const ailaInstance = new Aila({
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
        chat: { id: "123", userId: undefined },
        options: { usePersistence: false, useAnalytics: false },
        plugins: [],
      });

      expect(() => {
        ailaInstance.checkUserIdPresentIfPersisting();
      }).not.toThrow(AilaAuthenticationError);
    });
  });

  describe("generateSync", () => {
    // Should return a stream when generating a lesson plan with valid input
    it("should set the initial title, subject and key stage when presented with a valid initial user input", async () => {
      const ailaInstance = new Aila({
        lessonPlan: {},
        chat: { id: "123", userId: "user123" },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
      });

      expect(ailaInstance.lesson.plan.title).not.toBeDefined();
      expect(ailaInstance.lesson.plan.subject).not.toBeDefined();
      expect(ailaInstance.lesson.plan.keyStage).not.toBeDefined();

      await ailaInstance.generateSync({
        input: "Glaciation",
      });

      expect(ailaInstance.lesson.plan.title).toBeDefined();
      expect(ailaInstance.lesson.plan.subject).toBeDefined();
      expect(ailaInstance.lesson.plan.keyStage).toBeDefined();
    }, 20000);
  });

  describe("shutdown", () => {
    // This is so that analytics can be flushed before the process exits.
    // Posthog requires calling shutdown only once per client instance.
    it("should only call shutdown once", async () => {
      const shutdownMock = jest.fn();
      const ailaInstance = new Aila({
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

  describe("patching", () => {
    it("should apply patches to a lesson plan", async () => {
      const newTitle = "The Fall of the Roman Empire in Britain";
      const mockedResponse = {
        type: "patch",
        reasoning: "Testing",
        value: {
          op: "replace",
          path: "/title",
          value: newTitle,
        },
      };
      const llmService = new MockLLMService(
        `${JSON.stringify(mockedResponse)}␞\n`,
      );

      const ailaInstance = new Aila({
        lessonPlan: {
          title: "Roman Britain",
          subject: "history",
          keyStage: "key-stage-2",
          topic: "Roman Britain",
        },
        chat: {
          id: "123",
          userId: "user123",
          llmService,
        },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
      });

      await ailaInstance.generateSync({
        input:
          "Change the title to 'This should be ignored by the mocked service'",
      });

      expect(ailaInstance.lesson.plan.title).toBe(newTitle);
    }, 20000);
  });
});
