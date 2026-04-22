import { AilaStreamHandler } from "./AilaStreamHandler";

type MockChatOptions = {
  useAgenticAila: boolean;
};

type StreamHandlerTestHarness = {
  startAgentStream: () => Promise<{ status: "success" | "failed" }>;
  startLLMStream: () => Promise<void>;
  readFromStream: () => Promise<void>;
};

function createMockChat({ useAgenticAila }: MockChatOptions) {
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
    messages: [{ id: "u1", role: "user", content: "test prompt" }],
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
        detectors: [],
      },
      errorReporter: {
        reportError: jest.fn(),
      },
    },
    getPatchEnqueuer: () => ({
      setController: jest.fn(),
    }),
    initialiseChunks: jest.fn(),
    setupGeneration: jest.fn().mockImplementation(() => {
      chat.generation = { status: "REQUESTED" };
      return Promise.resolve();
    }),
    handleSettingInitialState: jest.fn().mockResolvedValue(undefined),
    handleSubjectWarning: jest.fn().mockResolvedValue(undefined),
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
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function getHarness(handler: AilaStreamHandler): StreamHandlerTestHarness {
    return handler as unknown as StreamHandlerTestHarness;
  }

  it("skips completion for failed agentic turns", async () => {
    const chat = createMockChat({ useAgenticAila: true });
    const handler = new AilaStreamHandler(chat as never);

    jest
      .spyOn(getHarness(handler), "startAgentStream")
      .mockResolvedValue({ status: "failed" });

    await consumeStream(handler.startStreaming());

    expect(chat.complete).not.toHaveBeenCalled();
    expect(chat.enqueue).not.toHaveBeenCalledWith({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });

  it("completes successful agentic turns", async () => {
    const chat = createMockChat({ useAgenticAila: true });
    const handler = new AilaStreamHandler(chat as never);

    jest
      .spyOn(getHarness(handler), "startAgentStream")
      .mockResolvedValue({ status: "success" });

    await consumeStream(handler.startStreaming());

    expect(chat.complete).toHaveBeenCalledTimes(1);
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });

  it("completes partial-success agentic turns", async () => {
    const chat = createMockChat({ useAgenticAila: true });
    const handler = new AilaStreamHandler(chat as never);

    jest
      .spyOn(getHarness(handler), "startAgentStream")
      .mockResolvedValue({ status: "success" });

    await consumeStream(handler.startStreaming());

    expect(chat.complete).toHaveBeenCalledTimes(1);
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });

  it("keeps non-agentic completion behavior unchanged", async () => {
    const chat = createMockChat({ useAgenticAila: false });
    const handler = new AilaStreamHandler(chat as never);

    jest
      .spyOn(getHarness(handler), "startLLMStream")
      .mockResolvedValue(undefined);
    jest
      .spyOn(getHarness(handler), "readFromStream")
      .mockResolvedValue(undefined);

    await consumeStream(handler.startStreaming());

    expect(chat.setupGeneration).toHaveBeenCalledTimes(1);
    expect(chat.complete).toHaveBeenCalledTimes(1);
    expect(chat.enqueue).toHaveBeenCalledWith({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  });
});
