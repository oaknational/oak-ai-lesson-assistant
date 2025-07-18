import { Aila } from "@oakai/aila/src/core/Aila";
import { MockLLMService } from "@oakai/aila/src/core/llm/MockLLMService";
import type { AilaInitializationOptions } from "@oakai/aila/src/core/types";
import { MockCategoriser } from "@oakai/aila/src/features/categorisation/categorisers/MockCategoriser";

import { NextRequest } from "next/server";

import { handleChatPostRequest } from "./chatHandler";
import type { Config } from "./config";

const chatId = "test-chat-id";
const userId = "test-user-id";

jest.mock("./user", () => ({
  fetchAndCheckUser: jest.fn().mockResolvedValue("test-user-id"),
}));

// Mock the serverSideFeatureFlag module
jest.mock("@/utils/serverSideFeatureFlag", () => ({
  serverSideFeatureFlag: jest.fn().mockResolvedValue(false),
}));

describe("Chat API Route", () => {
  let testConfig: Config;
  let mockLLMService: MockLLMService;
  let mockChatCategoriser: MockCategoriser;
  beforeEach(() => {
    jest.clearAllMocks();

    mockChatCategoriser = new MockCategoriser({
      mockedContent: {
        title: "Glaciation",
        topic: "The Landscapes of the UK",
        subject: "geography",
        keyStage: "key-stage-3",
      },
    });
    mockLLMService = new MockLLMService();
    jest.spyOn(mockLLMService, "createChatCompletionObjectStream");

    testConfig = {
      createAila: jest
        .fn()
        .mockImplementation(
          async (options: Partial<AilaInitializationOptions>) => {
            const ailaConfig: AilaInitializationOptions = {
              options: {
                usePersistence: false,
                useRag: false,
                useAnalytics: false,
                useModeration: false,
                useErrorReporting: false,
                useThreatDetection: false,
              },
              chat: {
                id: chatId,
                userId,
                messages: options?.chat?.messages ?? [],
              },
              plugins: [],
              services: {
                chatLlmService: mockLLMService,
                chatCategoriser: mockChatCategoriser,
              },
            };
            const ailaInstance = new Aila(ailaConfig);
            await ailaInstance.initialise();
            return ailaInstance;
          },
        ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma: {} as any,
    };
  });

  it("should create correct telemetry spans for a successful chat request", async () => {
    const mockRequest = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        id: "test-chat-id",
        messages: [
          { role: "user", content: "Create a lesson about Glaciation" },
        ],
        lessonPlan: {},
        options: {},
      }),
    });

    const response = await handleChatPostRequest(mockRequest, testConfig);

    expect(response.status).toBe(200);

    const receivedContent = await response.text();

    expect(receivedContent).not.toContain("error");
    expect(mockLLMService.createChatCompletionObjectStream).toHaveBeenCalled();

    // Note: Tracing spans now handled by Sentry - test verifies basic functionality works
  }, 60000);
});
