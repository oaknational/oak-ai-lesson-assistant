import { StrictMode } from "react";

import { act, cleanup, render, waitFor } from "@testing-library/react";
import { JSDOM } from "jsdom";
import type * as Zustand from "zustand";

import type { GetStore } from "@/stores/AilaStoresProvider";
import { createChatStore } from "@/stores/chatStore";
import { canAppendSelector } from "@/stores/chatStore/selectors";
import type { AiMessage, ChatState } from "@/stores/chatStore/types";
import type { TrpcUtils } from "@/utils/trpc";

import { AiSdk } from "./AiSdk";

// Keep the real useChat hook, transport, store and synchronization hooks. Only
// the surrounding providers and network are replaced.
let mockChatStore: ReturnType<typeof createChatStore>;
const mockLessonActions = {
  messageStarted: jest.fn(),
  messageFinished: jest.fn(),
  messagesUpdated: jest.fn(),
};

jest.mock("@/stores/AilaStoresProvider", () => ({
  useChatStore: (selector: (state: ChatState) => unknown) => {
    const { useStore } = jest.requireActual<typeof Zustand>("zustand");
    return useStore(mockChatStore, selector);
  },
  useChatActions: () => mockChatStore.getState().actions,
  useLessonPlanActions: () => mockLessonActions,
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
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const savedMessages: AiMessage[] = [
  { id: "u-saved", role: "user", content: "Create a lesson" },
  {
    id: "a-saved",
    role: "assistant",
    content: '\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n',
  },
];
type History = { messages: AiMessage[]; startingMessage?: string };

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

  const fetchMock = jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(() =>
      Promise.resolve(
        new Response(
          '\n␞\n{"type":"id","value":"a-new"}\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n',
        ),
      ),
    );
  render(
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
  function requestMessages() {
    const body = fetchMock.mock.calls[0]?.[1]?.body;
    expect(typeof body).toBe("string");
    return (JSON.parse(body as string) as { messages: AiMessage[] }).messages;
  }
  return { load, query, fetchMock, requestMessages, clickedStart };
}

describe("AiSdk history initialization", () => {
  it("loads history after mounting and includes it in the next request", async () => {
    const { load, fetchMock, requestMessages } = setup();
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
    expect(requestMessages().slice(0, 2)).toEqual(savedMessages);
    expect(requestMessages().at(-1)).toMatchObject({
      role: "user",
      content: "Make it easier",
    });
    await waitFor(() =>
      expect(mockLessonActions.messageFinished).toHaveBeenCalled(),
    );
  });

  it("hydrates before sending an automatic starting message, exactly once", async () => {
    const { load, fetchMock, requestMessages, clickedStart } = setup();
    await load({
      messages: savedMessages,
      startingMessage: "Continue this lesson",
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(requestMessages().slice(0, 2)).toEqual(savedMessages);
    expect(requestMessages().at(-1)?.content).toBe("Continue this lesson");
    expect(clickedStart).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(mockLessonActions.messageFinished).toHaveBeenCalled(),
    );
  });

  it("allows a new chat to start once its empty history has loaded", async () => {
    const { load, fetchMock, requestMessages } = setup();
    await load({ messages: [], startingMessage: "Create a lesson" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(requestMessages()).toEqual([
      expect.objectContaining({ role: "user", content: "Create a lesson" }),
    ]);
    await waitFor(() =>
      expect(mockLessonActions.messageFinished).toHaveBeenCalled(),
    );
  });

  it("ignores a late history response while a new reply is pending", async () => {
    const { load, query, fetchMock, requestMessages, clickedStart } = setup();
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
      response.resolve(new Response(""));
      await response.promise;
    });
    await waitFor(() =>
      expect(mockLessonActions.messageFinished).toHaveBeenCalled(),
    );
  });
});
