import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

import type { Message as AiMessage } from "ai";
import type { ChatRequestOptions, CreateMessage } from "ai";
import type { StoreApi } from "zustand";

export { AiMessage };

export type AiSdkActions = {
  stop: () => void;
  reload: () => Promise<string | null | undefined>;
  append: (
    message: AiMessage | CreateMessage,
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

export type ChatState = {
  id: string;
  ailaStreamingStatus: AilaStreamingStatus;

  initialMessages: AiMessage[];
  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;
  queuedUserAction: string | null;
  lessonPlan: LooseLessonPlan | null;
  input: string;
  chatAreaRef: React.RefObject<HTMLDivElement> | null;

  // From AI SDK
  aiSdkActions: AiSdkActions;

  actions: {
    // Setters
    setLessonPlan: (lessonPlan: LooseLessonPlan) => void;
    setAiSdkActions: (actions: AiSdkActions) => void;
    setMessages: (messages: AiMessage[], isLoading: boolean) => void;
    setInput: (input: string) => void;
    setChatAreaRef: (ref: React.RefObject<HTMLDivElement>) => void;

    // Action functions
    executeQueuedAction: () => void;
    append: (message: string) => void;
    stop: () => void;
    streamingFinished: () => void;
    scrollToBottom: () => void;
    fetchInitialMessages: () => Promise<void>;
    ailaStreamingStatusUpdated: (streamingStatus: AilaStreamingStatus) => void;
  };
};

export type ParsedMessage = AiMessage & {
  parts: MessagePart[];
  hasError: boolean;
  isEditing: boolean;
};

export type ChatSetter = StoreApi<ChatState>["setState"];
export type ChatGetter = StoreApi<ChatState>["getState"];
