import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";
import {
  getRagLessonPlansByIds,
  getRelevantLessonPlans,
  parseKeyStagesForRagSearch,
  parseSubjectsForRagSearch,
} from "@oakai/rag";

import OpenAI from "openai";

import { AilaThreatDetectionError } from "../../features/threatDetection";
import { createOpenAIMessageToUserAgent } from "../../lib/agentic-system/agents/messageToUserAgent";
import { createOpenAIPlannerAgent } from "../../lib/agentic-system/agents/plannerAgent";
import { createSectionAgentRegistry as createSectionAgentRegistryFactory } from "../../lib/agentic-system/agents/sectionAgents/sectionAgentRegistry";
import { ailaTurn } from "../../lib/agentic-system/ailaTurn";
import type { SectionAgentRegistry } from "../../lib/agentic-system/types";
import type { AilaPlugin } from "../plugins";
import { AilaStreamHandler } from "./AilaStreamHandler";
import type { Message } from "./types";

const actualOpenAIModule: { default: typeof OpenAI } =
  jest.requireActual("openai");
const actualSectionAgentRegistryModule: {
  createSectionAgentRegistry: typeof createSectionAgentRegistryFactory;
} = jest.requireActual(
  "../../lib/agentic-system/agents/sectionAgents/sectionAgentRegistry",
);

function createMockOpenAIClient() {
  return new OpenAI({ apiKey: "test" });
}

function createMockSectionAgentRegistry(): SectionAgentRegistry {
  return actualSectionAgentRegistryModule.createSectionAgentRegistry({
    openai: createMockOpenAIClient(),
    customAgentHandlers: {
      "starterQuiz--maths": jest.fn(),
      "exitQuiz--maths": jest.fn(),
    },
  });
}

jest.mock("@oakai/core/src/llm/openai", () => ({
  createOpenAIClient: jest.fn(
    () => new actualOpenAIModule.default({ apiKey: "test" }),
  ),
}));

jest.mock("@oakai/rag", () => ({
  getRagLessonPlansByIds: jest.fn().mockResolvedValue([]),
  getRelevantLessonPlans: jest.fn().mockResolvedValue([]),
  parseKeyStagesForRagSearch: jest.fn().mockReturnValue([]),
  parseSubjectsForRagSearch: jest.fn().mockReturnValue([]),
}));

jest.mock("../../lib/agentic-system/ailaTurn", () => ({
  ailaTurn: jest.fn(),
}));

jest.mock("../../lib/agentic-system/agents/messageToUserAgent", () => ({
  createOpenAIMessageToUserAgent: jest.fn(() => jest.fn()),
}));

jest.mock("../../lib/agentic-system/agents/plannerAgent", () => ({
  createOpenAIPlannerAgent: jest.fn(() => jest.fn()),
}));

jest.mock(
  "../../lib/agentic-system/agents/sectionAgents/sectionAgentRegistry",
  () => ({
    createSectionAgentRegistry: jest.fn(
      (props: Parameters<typeof createSectionAgentRegistryFactory>[0]) => {
        return actualSectionAgentRegistryModule.createSectionAgentRegistry(
          props,
        );
      },
    ),
  }),
);

type MockThreatDetector = {
  detectThreat: jest.Mock;
  isThreatError: jest.Mock;
};

type MockChatOptions = {
  useAgenticAila: boolean;
  threatDetectors?: MockThreatDetector[];
  plugins?: Partial<AilaPlugin>[];
};

const mockedAilaTurn = jest.mocked(ailaTurn);
const mockedCreateOpenAIClient = jest.mocked(createOpenAIClient);
const mockedGetRagLessonPlansByIds = jest.mocked(getRagLessonPlansByIds);
const mockedGetRelevantLessonPlans = jest.mocked(getRelevantLessonPlans);
const mockedParseKeyStagesForRagSearch = jest.mocked(
  parseKeyStagesForRagSearch,
);
const mockedParseSubjectsForRagSearch = jest.mocked(parseSubjectsForRagSearch);
const mockedCreateOpenAIMessageToUserAgent = jest.mocked(
  createOpenAIMessageToUserAgent,
);
const mockedCreateOpenAIPlannerAgent = jest.mocked(createOpenAIPlannerAgent);
const mockedCreateSectionAgentRegistry = jest.mocked(
  createSectionAgentRegistryFactory,
);

function createObjectStreamReader(chunks: string[] = ["stream chunk"]) {
  return new ReadableStream<string>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  }).getReader();
}

function createRejectingObjectStreamReader(error: unknown) {
  return {
    read: jest.fn().mockRejectedValue(error),
  } as unknown as ReadableStreamDefaultReader<string>;
}

function createThreatDetector(
  detectThreat: MockThreatDetector["detectThreat"],
): MockThreatDetector {
  return {
    detectThreat,
    isThreatError: jest.fn().mockReturnValue(false),
  };
}

const noThreatDetection: ThreatDetectionResult = {
  provider: "model_armor",
  isThreat: false,
  message: "No threats detected",
  findings: [],
  details: {},
};

function createMockChat({
  useAgenticAila,
  threatDetectors = [],
  plugins = [],
}: MockChatOptions) {
  const enqueue = jest.fn().mockResolvedValue(undefined);
  const complete = jest.fn().mockImplementation(async () => {
    await enqueue({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });

  const chat = {
    id: "chat_123",
    userId: "user_123",
    iteration: 1,
    messages: [{ id: "u1", role: "user", content: "test prompt" }] as Message[],
    relevantLessons: null,
    generation: useAgenticAila ? undefined : { status: "REQUESTED" },
    aila: {
      options: {
        useAgenticAila,
      },
      tracing: {
        span: async (
          _step: string,
          _attrs: { op: string },
          handler: () => Promise<void>,
        ) => await handler(),
      },
      threatDetection: {
        detectors: threatDetectors,
      },
      errorReporter: {
        reportError: jest.fn(),
      },
      document: {
        content: {},
      },
      plugins,
    },
    getPatchEnqueuer: () => ({
      setController: jest.fn(),
    }),
    initialiseChunks: jest.fn(),
    appendChunk: jest.fn(),
    setupGeneration: jest.fn().mockImplementation(() => {
      chat.generation = { status: "REQUESTED" };
      return Promise.resolve();
    }),
    handleSettingInitialState: jest.fn().mockResolvedValue(undefined),
    handleSubjectWarning: jest.fn().mockResolvedValue(undefined),
    completionMessages: jest
      .fn()
      .mockReturnValue([{ id: "u1", role: "user", content: "test prompt" }]),
    createChatCompletionObjectStream: jest
      .fn()
      .mockResolvedValue(createObjectStreamReader()),
    persistChat: jest.fn().mockResolvedValue(undefined),
    generationFailed: jest.fn().mockImplementation(async (error) => {
      if (error instanceof AilaThreatDetectionError) {
        await enqueue({
          type: "error",
          value: "Threat detected",
          message: "Threat was detected",
        });
      }
    }),
    complete,
    enqueue,
  };

  return chat;
}

async function consumeStream(stream: ReadableStream) {
  const reader = stream.getReader();

  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
}

describe("AilaStreamHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateOpenAIClient.mockReturnValue(createMockOpenAIClient());
    mockedGetRagLessonPlansByIds.mockResolvedValue([]);
    mockedGetRelevantLessonPlans.mockResolvedValue([]);
    mockedParseKeyStagesForRagSearch.mockReturnValue([]);
    mockedParseSubjectsForRagSearch.mockReturnValue([]);
    mockedCreateOpenAIMessageToUserAgent.mockReturnValue(jest.fn());
    mockedCreateOpenAIPlannerAgent.mockReturnValue(jest.fn());
    mockedCreateSectionAgentRegistry.mockReturnValue(
      createMockSectionAgentRegistry(),
    );
  });

  it("skips completion for failed agentic turns", async () => {
    mockedAilaTurn.mockResolvedValue({ status: "failed" });

    const chat = createMockChat({ useAgenticAila: true });
    const handler = new AilaStreamHandler(chat as never);

    await consumeStream(handler.startStreaming());

    expect(chat.complete).not.toHaveBeenCalled();
    expect(chat.enqueue).not.toHaveBeenCalledWith({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });

  it("shows a retry error and skips generation when non-agentic threat detection fails", async () => {
    const detectorError = new Error("Threat detector unavailable");
    const threatDetector = createThreatDetector(
      jest.fn().mockRejectedValue(detectorError),
    );
    const chat = createMockChat({
      useAgenticAila: false,
      threatDetectors: [threatDetector],
    });
    const handler = new AilaStreamHandler(chat as never);

    await expect(consumeStream(handler.startStreaming())).resolves.toBe(
      undefined,
    );

    expect(threatDetector.detectThreat).toHaveBeenCalledWith(chat.messages);
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "error",
      value: "Threat detection failed",
      message:
        "I wasn't able to check your message for safety. Please try again in a moment.",
    });
    expect(chat.aila.errorReporter.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ThreatDetectionFailureError",
      }),
      "Threat detection failed",
      "error",
    );
    expect(chat.createChatCompletionObjectStream).not.toHaveBeenCalled();
    expect(chat.complete).not.toHaveBeenCalled();
    expect(chat.generationFailed).not.toHaveBeenCalled();
  });

  it("shows a retry error and skips generation when agentic threat detection fails", async () => {
    const detectorError = new Error("Threat detector unavailable");
    const threatDetector = createThreatDetector(
      jest.fn().mockRejectedValue(detectorError),
    );
    const chat = createMockChat({
      useAgenticAila: true,
      threatDetectors: [threatDetector],
    });
    const handler = new AilaStreamHandler(chat as never);

    await expect(consumeStream(handler.startStreaming())).resolves.toBe(
      undefined,
    );

    expect(threatDetector.detectThreat).toHaveBeenCalledWith(chat.messages);
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "error",
      value: "Threat detection failed",
      message:
        "I wasn't able to check your message for safety. Please try again in a moment.",
    });
    expect(chat.aila.errorReporter.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ThreatDetectionFailureError",
      }),
      "Threat detection failed",
      "error",
    );
    expect(mockedAilaTurn).not.toHaveBeenCalled();
    expect(chat.complete).not.toHaveBeenCalled();
    expect(chat.generationFailed).not.toHaveBeenCalled();
  });

  it("handles detected threats without erroring the stream", async () => {
    const threatDetection: ThreatDetectionResult = {
      provider: "model_armor",
      isThreat: true,
      message: "Threat detected",
      severity: "high",
      category: "prompt_injection",
      findings: [],
      details: {},
    };
    const threatDetector = createThreatDetector(
      jest.fn().mockResolvedValue(threatDetection),
    );
    const chat = createMockChat({
      useAgenticAila: false,
      threatDetectors: [threatDetector],
    });
    const handler = new AilaStreamHandler(chat as never);

    await expect(consumeStream(handler.startStreaming())).resolves.toBe(
      undefined,
    );

    expect(chat.generationFailed).toHaveBeenCalledWith(
      expect.any(AilaThreatDetectionError),
    );
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "error",
      value: "Threat detected",
      message: "Threat was detected",
    });
    expect(chat.createChatCompletionObjectStream).not.toHaveBeenCalled();
    expect(chat.complete).not.toHaveBeenCalled();
  });

  it("handles provider threat errors without erroring the stream", async () => {
    const providerError = new Error("Prompt threat detected");
    const threatDetector = createThreatDetector(
      jest.fn().mockResolvedValue(noThreatDetection),
    );
    threatDetector.isThreatError.mockReturnValue(true);
    const onStreamError = jest.fn().mockRejectedValue(providerError);
    const chat = createMockChat({
      useAgenticAila: false,
      threatDetectors: [threatDetector],
      plugins: [{ onStreamError }],
    });
    chat.createChatCompletionObjectStream.mockResolvedValue(
      createRejectingObjectStreamReader(providerError),
    );
    const handler = new AilaStreamHandler(chat as never);

    await expect(consumeStream(handler.startStreaming())).resolves.toBe(
      undefined,
    );

    expect(chat.generationFailed).toHaveBeenCalledWith(
      expect.any(AilaThreatDetectionError),
    );
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "error",
      value: "Threat detected",
      message: "Threat was detected",
    });
    expect(onStreamError).not.toHaveBeenCalled();
    expect(chat.complete).not.toHaveBeenCalled();
  });

  it("completes successful agentic turns", async () => {
    mockedAilaTurn.mockImplementationOnce(async ({ callbacks }) => {
      await callbacks.onTurnComplete({
        stepsExecuted: [],
        document: {},
        ailaMessage:
          "Here's the updated lesson plan. Do you want to make any more changes?",
      });
      return { status: "success" };
    });

    const chat = createMockChat({ useAgenticAila: true });
    const handler = new AilaStreamHandler(chat as never);

    await consumeStream(handler.startStreaming());

    expect(mockedAilaTurn).toHaveBeenCalledTimes(1);
    expect(chat.complete).toHaveBeenCalledTimes(1);
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "state",
      reasoning: "final",
      value: {},
    });
    expect(chat.appendChunk).toHaveBeenCalledWith(
      expect.stringContaining('"sectionsEdited":[]'),
    );
    expect(chat.appendChunk).toHaveBeenCalledWith(
      expect.stringContaining(
        `"value":"Here's the updated lesson plan. Do you want to make any more changes?"`,
      ),
    );
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });

  it("completes partial-success agentic turns", async () => {
    mockedAilaTurn.mockImplementationOnce(async ({ callbacks }) => {
      await callbacks.onTurnComplete({
        stepsExecuted: [
          {
            type: "section",
            sectionKey: "subject",
            action: "generate",
            sectionInstructions: null,
          },
        ],
        document: { subject: "art" },
        ailaMessage:
          "The lesson plan has been updated, but the usual summary wasn't available. Please review the changes and let me know what you'd like to adjust next.",
      });
      return { status: "success" };
    });

    const chat = createMockChat({ useAgenticAila: true });
    const handler = new AilaStreamHandler(chat as never);

    await consumeStream(handler.startStreaming());

    expect(mockedAilaTurn).toHaveBeenCalledTimes(1);
    expect(chat.complete).toHaveBeenCalledTimes(1);
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "state",
      reasoning: "final",
      value: { subject: "art" },
    });
    expect(chat.appendChunk).toHaveBeenCalledWith(
      expect.stringContaining('"sectionsEdited":["subject"]'),
    );
    expect(chat.appendChunk).toHaveBeenCalledWith(
      expect.stringContaining(
        `"value":"The lesson plan has been updated, but the usual summary wasn't available. Please review the changes and let me know what you'd like to adjust next."`,
      ),
    );
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });

  it("keeps non-agentic completion behavior unchanged", async () => {
    const chat = createMockChat({ useAgenticAila: false });
    const handler = new AilaStreamHandler(chat as never);

    await consumeStream(handler.startStreaming());

    expect(chat.setupGeneration).toHaveBeenCalledTimes(1);
    expect(chat.createChatCompletionObjectStream).toHaveBeenCalledTimes(1);
    expect(chat.appendChunk).toHaveBeenCalledWith("stream chunk");
    expect(chat.complete).toHaveBeenCalledTimes(1);
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });
});
