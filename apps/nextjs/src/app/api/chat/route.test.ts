import { Aila } from "@oakai/aila";
import { MockLLMService } from "@oakai/aila/src/core/llm/MockLLMService";
import { MockCategoriser } from "@oakai/aila/src/features/categorisation/categorisers/MockCategoriser";
import { mockTracer } from "@oakai/core/src/tracing/mockTracer";
import { NextRequest } from "next/server";

import { consumeStream } from "../../../utils/testHelpers/consumeStream";
import { expectTracingSpan } from "../../../utils/testHelpers/tracing";
import { handleChatPostRequest } from "./chatHandler";
import { Config } from "./config";

const chatId = "test-chat-id";
const userId = "test-user-id";

describe("Chat API Route", () => {
  let testConfig: Config;
  let mockLLMService: MockLLMService;
  let mockChatCategoriser: MockCategoriser;
  beforeEach(() => {
    mockTracer.reset();
    jest.clearAllMocks();

    mockChatCategoriser = new MockCategoriser({
      mockedLessonPlan: {
        title: "Glaciation",
        topic: "The Landscapes of the UK",
        subject: "geography",
        keyStage: "key-stage-3",
      },
    });
    mockLLMService = new MockLLMService();
    jest.spyOn(mockLLMService, "createChatCompletionStream");

    testConfig = {
      shouldPerformUserLookup: false,
      handleUserLookup: jest.fn(),
      mockUserId: userId,
      createAila: jest.fn().mockImplementation(async (options) => {
        const ailaConfig = {
          options: {
            usePersistence: false,
            useRag: false,
            useAnalytics: false,
            useModeration: false,
            useErrorReporting: false,
            useThreatDetection: false,
            useRateLimiting: false,
          },
          chat: {
            id: chatId,
            userId,
            messages: options.chat.messages ?? [],
          },
          plugins: [],
          services: {
            chatLlmService: mockLLMService,
            chatCategoriser: mockChatCategoriser,
          },
        };
        return new Aila(ailaConfig);
      }),
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

    const receivedContent = await consumeStream(
      response.body as ReadableStream,
    );

    expect(receivedContent).not.toContain("error");
    expect(mockLLMService.createChatCompletionStream).toHaveBeenCalled();

    expectTracingSpan("chat-aila-generate").toHaveBeenExecuted();
    expectTracingSpan("chat-api").toHaveBeenExecutedWith({
      chat_id: "test-chat-id",
    });

    expect(testConfig.handleUserLookup).not.toHaveBeenCalled();
  }, 30000);
});
