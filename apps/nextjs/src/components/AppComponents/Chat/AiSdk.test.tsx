import { StrictMode } from "react";

import { act, cleanup, render, waitFor } from "@testing-library/react";
import { JSDOM } from "jsdom";
import type * as Zustand from "zustand";

import {
  CHAT_STREAM_PROTOCOL,
  CHAT_STREAM_PROTOCOL_HEADER,
} from "@/app/api/chat/streamProtocol";
import type { GetStore } from "@/stores/AilaStoresProvider";
import { createChatStore } from "@/stores/chatStore";
import { canAppendSelector } from "@/stores/chatStore/selectors";
import type { AiMessage, ChatState } from "@/stores/chatStore/types";
import { createLessonPlanStore } from "@/stores/lessonPlanStore";
import type { TrpcUtils } from "@/utils/trpc";

import { AiSdk } from "./AiSdk";

// Keep the real useChat hook, transport, stores and synchronization hooks.
// Only the surrounding providers and network are replaced.
let mockChatStore: ReturnType<typeof createChatStore>;
let mockLessonPlanStore: ReturnType<typeof createLessonPlanStore>;

jest.mock("@/stores/AilaStoresProvider", () => ({
  useChatStore: (selector: (state: ChatState) => unknown) => {
    const { useStore } = jest.requireActual<typeof Zustand>("zustand");
    return useStore(mockChatStore, selector);
  },
  useChatActions: () => mockChatStore.getState().actions,
  useLessonPlanActions: () => mockLessonPlanStore.getState().actions,
}));
jest.mock("@/lib/analytics/useAnalytics", () => ({
  __esModule: true,
  default: () => ({ reset: jest.fn() }),
}));
jest.mock("next/navigation", () => ({
  usePathname: () => "/aila/lesson/chat-test",
}));
jest.mock("@sentry/nextjs", () => ({ captureException: jest.fn() }));

// Use Node's real fetch/stream primitives with a DOM for React rendering.
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.test/aila/lesson/chat-test",
});
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

beforeAll(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: dom.window,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: dom.window.document,
  });
});
afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});
afterAll(() => {
  for (const [key, descriptor] of [
    ["window", originalWindow],
    ["document", originalDocument],
  ] as const) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
  dom.window.close();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// A response from the chat endpoint, which marks its stream
function chatResponse(body: BodyInit) {
  return new Response(body, {
    headers: { [CHAT_STREAM_PROTOCOL_HEADER]: CHAT_STREAM_PROTOCOL },
  });
}

const completeReply =
  '\n␞\n{"type":"id","value":"a-new"}\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n';

// A chat response whose stream the test writes to, closes or breaks
function controlledReply() {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  return {
    response: chatResponse(body),
    write: (text: string) => controller.enqueue(encoder.encode(text)),
    close: () => controller.close(),
    fail: (error: Error) => controller.error(error),
  };
}

const savedMessages: AiMessage[] = [
  { id: "u-saved", role: "user", content: "Create a lesson" },
  {
    id: "a-saved",
    role: "assistant",
    content: '\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n',
  },
];
type History = {
  messages: AiMessage[];
  startingMessage?: string;
  lessonPlan?: object;
};

function setup() {
  const history = deferred<History>();
  const query = jest.fn().mockReturnValue(history.promise);
  const clickedStart = jest.fn();
  const getStore = (() => ({
    actions: { clickedStart },
  })) as unknown as GetStore;
  const trpc = {
    client: { chat: { appSessions: { getChat: { query } } } },
  } as unknown as TrpcUtils;
  mockChatStore = createChatStore("chat-test", getStore, trpc);
  mockLessonPlanStore = createLessonPlanStore({
    id: "chat-test",
    trpcUtils: trpc,
  });
  const messageFinished = jest.spyOn(
    mockLessonPlanStore.getState().actions,
    "messageFinished",
  );

  const fetchMock = jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(() => Promise.resolve(chatResponse(completeReply)));
  const { unmount } = render(
    <StrictMode>
      <AiSdk id="chat-test" />
    </StrictMode>,
  );
  const loading = mockChatStore.getState().actions.fetchInitialMessages();

  async function load(value: History) {
    await act(async () => {
      history.resolve(value);
      await loading;
    });
  }
  async function failToLoad() {
    await act(async () => {
      history.reject(new Error("Database unavailable"));
      await loading;
    });
  }
  function requestMessages(call = 0) {
    const body = fetchMock.mock.calls[call]?.[1]?.body;
    expect(typeof body).toBe("string");
    return (JSON.parse(body as string) as { messages: AiMessage[] }).messages;
  }
  function requestSignal(call = 0) {
    const signal = fetchMock.mock.calls[call]?.[1]?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    return signal as AbortSignal;
  }
  function send(content: string) {
    act(() =>
      mockChatStore.getState().actions.append({ type: "message", content }),
    );
  }
  return {
    load,
    failToLoad,
    query,
    fetchMock,
    requestMessages,
    requestSignal,
    send,
    unmount,
    clickedStart,
    messageFinished,
  };
}

describe("AiSdk history initialization", () => {
  it("loads history after mounting and includes it in the next request", async () => {
    const { load, fetchMock, requestMessages, messageFinished } = setup();
    expect(canAppendSelector(mockChatStore.getState())).toBe(false);

    await load({ messages: savedMessages });
    expect(mockChatStore.getState().stableMessages.map(({ id }) => id)).toEqual(
      ["u-saved", "a-saved"],
    );
    expect(canAppendSelector(mockChatStore.getState())).toBe(true);

    act(() =>
      mockChatStore
        .getState()
        .actions.append({ type: "message", content: "Make it easier" }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(
      new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get(
        CHAT_STREAM_PROTOCOL_HEADER,
      ),
    ).toBe(CHAT_STREAM_PROTOCOL);
    expect(requestMessages().slice(0, 2)).toEqual(savedMessages);
    expect(requestMessages().at(-1)).toMatchObject({
      role: "user",
      content: "Make it easier",
    });
    await waitFor(() => expect(messageFinished).toHaveBeenCalled());
  });

  it("hydrates before sending an automatic starting message, exactly once", async () => {
    const { load, fetchMock, requestMessages, clickedStart, messageFinished } =
      setup();
    await load({
      messages: savedMessages,
      startingMessage: "Continue this lesson",
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(requestMessages().slice(0, 2)).toEqual(savedMessages);
    expect(requestMessages().at(-1)?.content).toBe("Continue this lesson");
    expect(clickedStart).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(messageFinished).toHaveBeenCalled());
  });

  it("allows a new chat to start once its empty history has loaded", async () => {
    const { load, fetchMock, requestMessages, messageFinished } = setup();
    await load({ messages: [], startingMessage: "Create a lesson" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(requestMessages()).toEqual([
      expect.objectContaining({ role: "user", content: "Create a lesson" }),
    ]);
    await waitFor(() => expect(messageFinished).toHaveBeenCalled());
  });

  it("ignores a late history response while a new reply is pending", async () => {
    const {
      load,
      query,
      fetchMock,
      requestMessages,
      clickedStart,
      messageFinished,
    } = setup();
    const lateHistory = deferred<History>();
    query.mockReturnValueOnce(lateHistory.promise);
    const lateLoading = mockChatStore.getState().actions.fetchInitialMessages();
    const response = deferred<Response>();
    fetchMock.mockReturnValueOnce(response.promise);

    await load({ messages: savedMessages, startingMessage: "Continue" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => {
      lateHistory.resolve({ messages: [], startingMessage: "Stale prompt" });
      await lateLoading;
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(clickedStart).toHaveBeenCalledTimes(1);
    expect(
      mockChatStore.getState().stableMessages.map(({ content }) => content),
    ).toEqual([...savedMessages.map(({ content }) => content), "Continue"]);
    expect(requestMessages().slice(0, 2)).toEqual(savedMessages);

    await act(async () => {
      response.resolve(chatResponse(""));
      await response.promise;
    });
    await waitFor(() => expect(messageFinished).toHaveBeenCalled());
  });
});

describe("AiSdk turn lifecycle", () => {
  it("lets the user send when the history fails to load", async () => {
    const { failToLoad, send, fetchMock, requestMessages, messageFinished } =
      setup();
    await failToLoad();

    expect(canAppendSelector(mockChatStore.getState())).toBe(true);
    send("Create a lesson");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(requestMessages()).toEqual([
      expect.objectContaining({ role: "user", content: "Create a lesson" }),
    ]);
    await waitFor(() => expect(messageFinished).toHaveBeenCalled());
  });

  it("keeps a turn running when the chat is left mid-generation", async () => {
    const { load, send, fetchMock, requestSignal, unmount, messageFinished } =
      setup();
    await load({ messages: [] });
    const reply = controlledReply();
    fetchMock.mockResolvedValueOnce(reply.response);

    send("Create a lesson");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    reply.write('\n␞\n{"type":"id","value":"a-new"}\n␞\n');
    unmount();

    expect(requestSignal().aborted).toBe(false);
    await act(async () => {
      reply.write('{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n');
      reply.close();
      await Promise.resolve();
    });
    await waitFor(() => expect(messageFinished).toHaveBeenCalledTimes(1));
    expect(mockLessonPlanStore.getState().isAcceptingChanges).toBe(false);
  });

  it("stops a turn, then sends and finishes the next one", async () => {
    const { load, send, fetchMock, requestSignal, messageFinished } = setup();
    await load({ messages: [] });
    const reply = controlledReply();
    fetchMock.mockResolvedValueOnce(reply.response);

    send("Create a lesson");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    act(() => reply.write('\n␞\n{"type":"id","value":"a-stopped"}\n␞\n'));
    await waitFor(() =>
      expect(mockChatStore.getState().ailaStreamingStatus).not.toBe("Idle"),
    );
    act(() => mockChatStore.getState().actions.stop());

    expect(requestSignal().aborted).toBe(true);
    await waitFor(() =>
      expect(mockChatStore.getState().ailaStreamingStatus).toBe("Idle"),
    );
    expect(messageFinished).not.toHaveBeenCalled();

    send("Make it shorter");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(messageFinished).toHaveBeenCalledTimes(1));
    expect(mockLessonPlanStore.getState().isAcceptingChanges).toBe(false);
  });

  it("marks an interrupted turn as failed and retries it", async () => {
    const { load, send, fetchMock, requestMessages, messageFinished } = setup();
    await load({ messages: [] });
    const reply = controlledReply();
    fetchMock.mockResolvedValueOnce(reply.response);

    send("Create a lesson");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    act(() => {
      reply.write('\n␞\n{"type":"id","value":"a-broken"}\n␞\n');
      reply.fail(new Error("Network connection lost"));
    });
    await waitFor(() =>
      expect(mockChatStore.getState().streamingError).toBe(true),
    );
    expect(messageFinished).not.toHaveBeenCalled();

    await act(() => mockChatStore.getState().aiSdkActions.reload());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(requestMessages(1)).toEqual([
      expect.objectContaining({ role: "user", content: "Create a lesson" }),
    ]);
    await waitFor(() => expect(messageFinished).toHaveBeenCalledTimes(1));
  });

  it("treats a response that isn't Aila's stream as an error", async () => {
    const { load, send, fetchMock, messageFinished } = setup();
    await load({ messages: [] });
    fetchMock.mockResolvedValueOnce(
      new Response("<html>Sign in</html>", {
        headers: { "Content-Type": "text/html" },
      }),
    );

    send("Create a lesson");
    await waitFor(() =>
      expect(mockChatStore.getState().streamingError).toBe(true),
    );
    expect(messageFinished).not.toHaveBeenCalled();
    expect(
      mockChatStore
        .getState()
        .stableMessages.some(({ content }) => content.includes("<html>")),
    ).toBe(false);
  });
});
