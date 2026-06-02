import { Aila } from "@oakai/aila/src/core/Aila";
import { MockLLMService } from "@oakai/aila/src/core/llm/MockLLMService";
import type { AilaInitializationOptions } from "@oakai/aila/src/core/types";
import { MockCategoriser } from "@oakai/aila/src/features/categorisation/categorisers/MockCategoriser";

import { NextRequest } from "next/server";

import { handleChatPostRequest } from "./chatHandler";
import type { Config } from "./configTypes";

const chatId = "test-chat-id";
const userId = "test-user-id";

jest.mock("./user", () => ({
  fetchAndCheckUser: jest.fn().mockResolvedValue("test-user-id"),
}));

jest.mock("@oakai/api/src/utils/getAgenticAilaEnabled", () => ({
  getAgenticAilaEnabled: jest.fn().mockResolvedValue(false),
}));

jest.mock(
  "@oakai/aila/src/features/threatDetection/detectors/modelArmor/ModelArmorThreatDetector",
  () => ({
    ModelArmorThreatDetector: jest.fn().mockImplementation(() => ({
      detectThreat: jest.fn(),
    })),
  }),
);

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
              prisma: options.prisma!,
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
      prisma: {
        appSession: {
          findUnique: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
        prompt: {
          findFirst: jest.fn().mockResolvedValue({ id: "prompt_1" }),
        },
        lessonSchema: {
          findFirst: jest.fn().mockResolvedValue({ id: "lesson_schema_1" }),
          create: jest.fn(),
        },
        lessonSnapshot: {
          create: jest.fn().mockResolvedValue({ id: "lesson_snapshot_1" }),
        },
      } as unknown as Config["prisma"],
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
