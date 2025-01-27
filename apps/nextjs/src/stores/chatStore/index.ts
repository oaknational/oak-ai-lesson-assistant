import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import { create } from "zustand";

import { handleExecuteQueuedAction } from "./stateActionFunctions/handleExecuteQueuedAction";
import { handleQueueUserAction } from "./stateActionFunctions/handleQueueUserAction";
import { handleSetMessages } from "./stateActionFunctions/handleSetMessages";
import { handleStop } from "./stateActionFunctions/handleStop";
import type { AiMessage, ParsedMessage } from "./types";

const log = aiLogger("chat:store");

type Actions = {
  stop: () => void;
  reload: () => void;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
};

export type AilaStreamingStatus =
  | "Loading"
  | "RequestMade"
  | "StreamingLessonPlan"
  | "StreamingChatResponse"
  | "StreamingExperimentalPatches"
  | "Moderating"
  | "Idle";

export type ChatStore = {
  id: string;
  ailaStreamingStatus: AilaStreamingStatus;

  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;
  queuedUserAction: string | null;
  isExecutingQueuedAction: boolean;
  lessonPlan: LooseLessonPlan | null;

  chatAreaRef: React.RefObject<HTMLDivElement>;
  input: string;
  isStreaming: boolean;

  // From AI SDK
  isLoading: boolean;

  // Grouped Actions
  actions: Actions;

  // Setters
  setId: (id: string) => void;
  setInput: (input: string) => void;
  setChatAreaRef: (ref: React.RefObject<HTMLDivElement>) => void;
  setLessonPlan: (lessonPlan: LooseLessonPlan) => void;
  setAiSdkActions: (actions: Actions) => void;
  setMessages: (messages: AiMessage[], isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  queueUserAction: (action: string) => Promise<void>;
  executeQueuedAction: () => Promise<void>;
  stop: () => void;

  reset: () => void;
};

// Define the initial state as a separate object
const initialState: Omit<
  ChatStore,
  keyof {
    setId: () => void;
    setInput: () => void;
    setChatAreaRef: () => void;
    setLessonPlan: () => void;
    setAiSdkActions: () => void;
    setMessages: () => void;
    setIsLoading: () => void;
    queueUserAction: () => void;
    executeQueuedAction: () => void;
    stop: () => void;
    reset: () => void;
  }
> = {
  id: "",
  ailaStreamingStatus: "Idle",
  stableMessages: [],
  streamingMessage: null,
  queuedUserAction: null,
  isExecutingQueuedAction: false,
  lessonPlan: null,
  chatAreaRef: { current: null },
  input: "",
  isStreaming: false,
  isLoading: false,
  actions: {
    stop: () => {},
    reload: () => {},
    append: async () => "",
  },
};

export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  // Setters
  setId: (id) => set({ id }),
  setAiSdkActions: (actions) => set({ actions }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setLessonPlan: (lessonPlan) => set({ lessonPlan }),
  setInput: (input) => set({ input }),
  setChatAreaRef: (ref) => set({ chatAreaRef: ref }),

  // Action functions
  queueUserAction: handleQueueUserAction(set, get),
  executeQueuedAction: handleExecuteQueuedAction(set, get),
  stop: handleStop(set, get),
  setMessages: handleSetMessages(set, get),

  // Reset function
  reset: () => set(initialState),
}));

useChatStore.subscribe((state) => {
  log.info("Chat store updated", state);
});
