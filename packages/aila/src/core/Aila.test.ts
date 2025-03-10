import type { Polly } from "@pollyjs/core";

import { setupPolly } from "../../tests/mocks/setupPolly";
import type { AilaCategorisation } from "../features/categorisation";
import { MockCategoriser } from "../features/categorisation/categorisers/MockCategoriser";
import { Aila } from "./Aila";
import { AilaAuthenticationError } from "./AilaError";
import { MockLLMService } from "./llm/MockLLMService";

describe("Aila", () => {
  let polly: Polly;

  beforeAll(() => {
    polly = setupPolly();
  });

  afterAll(async () => {
    await polly.stop();
  });

  describe("constructing", () => {
    it("should initialise Aila instance with persistence", () => {
      const ailaInstance = new Aila({
        document: {
          content: {},
        },
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
        document: {
          content: {},
        },
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
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
      });

      await ailaInstance.initialise();

      expect(ailaInstance.document.content.title).toBe("Roman Britain");
      expect(ailaInstance.document.content.subject).toBe("history");
      expect(ailaInstance.document.content.keyStage).toBe("key-stage-2");
    });

    it("should use the categoriser to determine the lesson plan from user input if the lesson plan is not already set up", async () => {
      const mockCategoriser = {
        categorise: jest.fn().mockResolvedValue({
          keyStage: "key-stage-2",
          subject: "history",
          title: "Roman Britain",
          topic: "The Roman Empire",
        }),
      };

      const ailaInstance = new Aila({
        document: {
          content: {},
        },
        chat: {
          id: "123",
          userId: "user123",
          messages: [
            {
              id: "1",
              role: "user",
              content:
                "Create a lesson about Roman Britain for Key Stage 2 History",
            },
          ],
        },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
        services: {
          chatCategoriser: mockCategoriser as unknown as AilaCategorisation,
        },
      });

      await ailaInstance.initialise();

      expect(mockCategoriser.categorise).toHaveBeenCalledTimes(1);
      expect(ailaInstance.document.content.title).toBe("Roman Britain");
      expect(ailaInstance.document.content.subject).toBe("history");
      expect(ailaInstance.document.content.keyStage).toBe("key-stage-2");
    });

    it("should not use the categoriser to determine the lesson plan from user input if the lesson plan is already set up", async () => {
      const mockCategoriser = {
        categorise: jest.fn().mockResolvedValue({
          keyStage: "key-stage-2",
          subject: "history",
          title: "Roman Britain",
          topic: "The Roman Empire",
        }),
      };
      const ailaInstance = new Aila({
        document: {
          content: {
            title: "Roman Britain",
            subject: "history",
            keyStage: "key-stage-2",
          },
        },
        chat: {
          id: "123",
          userId: "user123",
          messages: [
            {
              id: "1",
              role: "user",
              content:
                "Create a lesson about Roman Britain for Key Stage 2 History",
            },
          ],
        },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
        services: {
          chatCategoriser: mockCategoriser as unknown as AilaCategorisation,
        },
      });

      await ailaInstance.initialise();
      expect(mockCategoriser.categorise).toHaveBeenCalledTimes(0);
      expect(ailaInstance.document.content.title).toBe("Roman Britain");
      expect(ailaInstance.document.content.subject).toBe("history");
      expect(ailaInstance.document.content.keyStage).toBe("key-stage-2");
    });

    // Calling initialise method successfully initializes the Aila instance
    it("should successfully initialize the Aila instance when calling the initialise method, and by default not set the lesson plan to initial values", async () => {
      const ailaInstance = new Aila({
        document: {
          content: {},
        },
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
      expect(ailaInstance.document.content.title).not.toBeDefined();
      expect(ailaInstance.document.content.subject).not.toBeDefined();
      expect(ailaInstance.document.content.keyStage).not.toBeDefined();
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
      const mockChatCategoriser = new MockCategoriser({
        mockedContent: {
          title: "Glaciation",
          topic: "The Landscapes of the UK",
          subject: "geography",
          keyStage: "key-stage-3",
        },
      });
      const mockLLMService = new MockLLMService();

      const ailaInstance = new Aila({
        document: {
          content: {},
        },
        chat: { id: "123", userId: "user123" },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
        services: {
          chatLlmService: mockLLMService,
          chatCategoriser: mockChatCategoriser,
        },
      });

      expect(ailaInstance.document.content.title).not.toBeDefined();
      expect(ailaInstance.document.content.subject).not.toBeDefined();
      expect(ailaInstance.document.content.keyStage).not.toBeDefined();

      await ailaInstance.initialise();

      await ailaInstance.generateSync({
        input: "Glaciation",
      });

      expect(ailaInstance.document.content.title).toBeDefined();
      expect(ailaInstance.document.content.subject).toBeDefined();
      expect(ailaInstance.document.content.keyStage).toBeDefined();
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
      const chatLlmService = new MockLLMService([
        JSON.stringify(mockedResponse),
      ]);
      const ailaInstance = new Aila({
        document: {
          content: {
            title: "Roman Britain",
            subject: "history",
            keyStage: "key-stage-2",
            topic: "Roman Britain",
          },
        },
        chat: {
          id: "123",
          userId: "user123",
        },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
          useThreatDetection: false,
        },
        plugins: [],
        services: {
          chatLlmService,
        },
      });

      await ailaInstance.initialise();

      await ailaInstance.generateSync({
        input:
          "Change the title to 'This should be ignored by the mocked service'",
      });

      expect(ailaInstance.document.content.title).toBe(newTitle);
    }, 20000);
  });

  describe("categorisation", () => {
    it("should use the provided MockCategoriser", async () => {
      const mockedContent = {
        title: "Mocked Lesson Plan",
        subject: "Mocked Subject",
        keyStage: "key-stage-3",
      };

      const mockCategoriser = new MockCategoriser({ mockedContent });

      const ailaInstance = new Aila({
        document: {
          content: {},
        },
        chat: { id: "123", userId: "user123" },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        services: {
          chatLlmService: new MockLLMService(),
          chatCategoriser: mockCategoriser,
        },
        plugins: [],
      });

      await ailaInstance.initialise();

      expect(ailaInstance.document.content.title).toBe("Mocked Lesson Plan");
      expect(ailaInstance.document.content.subject).toBe("Mocked Subject");
      expect(ailaInstance.document.content.keyStage).toBe("key-stage-3");
    }, 8000);
  });

  describe("categorisation and LLM service", () => {
    it("should use both MockCategoriser and MockLLMService", async () => {
      const mockedContent = {
        title: "Mocked Lesson Plan",
        subject: "Mocked Subject",
        keyStage: "key-stage-3",
      };

      const mockCategoriser = new MockCategoriser({ mockedContent });

      const mockLLMResponse = [
        '{"type":"patch","reasoning":"Update title","value":{"op":"replace","path":"/title","value":"Updated Mocked Lesson Plan"}}␞\n',

        '{"type":"patch","reasoning":"Update subject","value":{"op":"replace","path":"/subject","value":"Updated Mocked Subject"}}␞\n',
      ];
      const mockLLMService = new MockLLMService(mockLLMResponse);

      const ailaInstance = new Aila({
        document: {
          content: {},
        },
        chat: { id: "123", userId: "user123" },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        services: {
          chatCategoriser: mockCategoriser,
          chatLlmService: mockLLMService,
        },
        plugins: [],
      });

      await ailaInstance.initialise();

      // Check if MockCategoriser was used
      expect(ailaInstance.document.content.title).toBe("Mocked Lesson Plan");
      expect(ailaInstance.document.content.subject).toBe("Mocked Subject");
      expect(ailaInstance.document.content.keyStage).toBe("key-stage-3");

      // Use MockLLMService to generate a response
      await ailaInstance.generateSync({ input: "Test input" });

      // Check if MockLLMService updates were applied
      expect(ailaInstance.document.content.title).toBe(
        "Updated Mocked Lesson Plan",
      );
      expect(ailaInstance.document.content.subject).toBe(
        "Updated Mocked Subject",
      );
    }, 8000);
  });
});
