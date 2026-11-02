import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";

import type { StoreApi } from "zustand";

/**
 * A chat message as the store and UI use it: plain text content. The AI SDK
 * represents messages as parts, and AiSdk.tsx converts between the two
 */
export type AiMessage = {
  id: string;
  role: "system" | "user" | "assistant" | "data";
  content: string;
};

export type ChatAction =
  | { type: "message"; content: string }
  | { type: "continue" }
  | { type: "regenerate" };

export type AiSdkActions = {
  stop: () => void;
  reload: () => Promise<void>;
  append: (message: { content: string; role: "user" }) => Promise<void>;
};

export type AilaStreamingStatus =
  | "Loading"
  | "RequestMade"
  | "StreamingLessonPlan"
  | "StreamingChatResponse"
  | "Moderating"
  | "Idle";

export type ChatState = {
  id: string;
  ailaStreamingStatus: AilaStreamingStatus;
  streamingError: boolean;
  streamingFailedTurn: boolean;

  initialMessages: AiMessage[];
  stableMessages: ParsedMessage[];
  streamingMessage: ParsedMessage | null;
  queuedUserAction: ChatAction | null;
  lessonPlan: PartialLessonPlan | null;
  input: string;
  chatAreaRef: React.RefObject<HTMLDivElement> | null;

  // From AI SDK
  aiSdkActions: AiSdkActions;

  actions: {
    // Setters
    setLessonPlan: (lessonPlan: PartialLessonPlan) => void;
    setAiSdkActions: (actions: AiSdkActions) => void;
    setMessages: (messages: AiMessage[], isLoading: boolean) => void;
    setInput: (input: string) => void;
    setChatAreaRef: (ref: React.RefObject<HTMLDivElement>) => void;

    // Action functions
    executeQueuedAction: () => void;
    append: (action: ChatAction) => void;
    stop: () => void;
    streamingFinished: () => void;
    streamingFailed: () => void;
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
