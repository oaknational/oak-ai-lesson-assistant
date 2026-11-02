import { useMemo, useRef } from "react";
import { toast } from "react-hot-toast";

import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";

import { useChat } from "@ai-sdk/react";
import * as Sentry from "@sentry/nextjs";
import { TextStreamChatTransport } from "ai";
import type { UIMessage } from "ai";
import { nanoid } from "nanoid";
import { usePathname } from "next/navigation";
import { useChatStoreAiSdkSync } from "src/stores/chatStore/hooks/useChatStoreAiSdkSync";
import { useLessonPlanStoreAiSdkSync } from "src/stores/lessonPlanStore/hooks/useLessonPlanStoreAiSdkSync";

import useAnalytics from "@/lib/analytics/useAnalytics";
import {
  useChatActions,
  useChatStore,
  useLessonPlanActions,
} from "@/stores/AilaStoresProvider";
import type { AiMessage, AiSdkActions } from "@/stores/chatStore/types";
import { getAilaUrl } from "@/utils/getAilaUrl";

import { findMessageIdFromContent } from "./Chat/utils";
import { isAccountLocked } from "./chat-message/protocol";

const log = aiLogger("chat");

export type AiSdkProps = {
  id: string;
};

function useActionMessages() {
  const analytics = useAnalytics();

  return {
    invokeActionMessages: (messageContent: string) => {
      const shouldShowLockedPage = parseMessageParts(messageContent)
        .map((p) => p.document)
        .some(isAccountLocked);

      if (shouldShowLockedPage) {
        analytics.reset();
        window.location.href = "/legal/account-locked";
      }
    },
  };
}

// The AI SDK stores messages as parts; the stores and the chat endpoint use
// plain text content
function toUIMessage(message: AiMessage): UIMessage[] {
  if (message.role === "data") {
    return [];
  }
  return [
    {
      id: message.id,
      role: message.role,
      parts: [{ type: "text", text: message.content }],
    },
  ];
}

function getTextContent(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function toAiMessage(message: UIMessage): AiMessage {
  return {
    id: message.id,
    role: message.role,
    content: getTextContent(message),
  };
}

export function AiSdk({ id }: Readonly<AiSdkProps>) {
  const path = usePathname();

  const initialMessages = useChatStore((state) => state.initialMessages);
  const chatActions = useChatActions();
  const lessonPlanActions = useLessonPlanActions();

  // TODO: move to chat store
  const { invokeActionMessages } = useActionMessages();

  // The chat keeps the transport from its first render
  const transport = useMemo(
    () =>
      new TextStreamChatTransport<UIMessage>({
        api: "/api/chat",
        // The chat endpoint expects messages with text content
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { id, messages: messages.map(toAiMessage) },
        }),
        async fetch(input: RequestInfo | URL, init?: RequestInit) {
          lessonPlanActions.messageStarted();
          const response = await fetch(input, init);
          log.info("Chat: On Response");

          // TODO: create onResponse handler in store and call from there
          chatActions.scrollToBottom();

          if (response.status === 401) {
            toast.error(response.statusText);
          }
          if (!path?.includes("chat/[id]")) {
            window.history.pushState({}, "", `${getAilaUrl("lesson")}/${id}`);
          }
          return response;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const {
    messages: uiMessages,
    sendMessage,
    regenerate,
    stop: stopStreaming,
    status,
  } = useChat({
    id,
    // NOTE: these initial messages are used by the chat endpoint
    messages: initialMessages.flatMap(toUIMessage),
    generateId: () => generateMessageId({ role: "user" }),
    transport,
    onError(error) {
      Sentry.captureException(new Error("Use chat error"), {
        extra: { originalError: error },
      });
      log.error("UseChat error", { error, messages: uiMessages });

      // Mark that an error occurred to prevent analytics tracking
      chatActions.streamingFailed();
    },
    onFinish({ message, isAbort, isError }) {
      // Stopped and failed turns are handled by stop and onError
      if (isAbort || isError) {
        return;
      }
      log.info("Chat: On Finish", new Date().toISOString(), {
        message,
        path,
      });

      invokeActionMessages(getTextContent(message));

      chatActions.streamingFinished();
      lessonPlanActions.messageFinished();
    },
  });

  /**
   * This is a hack to ensure that the assistant messages have a stable id
   * across server and client.
   * We should move away from this either when the AI SDK supports it
   * natively, or when we move away from streaming.
   */
  const pendingIds = useRef(new Map<string, string>());
  const messages = useMemo(
    () =>
      uiMessages.map((uiMessage) => {
        const message = toAiMessage(uiMessage);
        if (message.role !== "assistant" || message.id.startsWith("a-")) {
          return message;
        }

        const idFromContent = findMessageIdFromContent(message);
        if (idFromContent) {
          return { ...message, id: idFromContent };
        }

        let pendingId = pendingIds.current.get(uiMessage.id);
        if (!pendingId) {
          pendingId = "TEMP_PENDING_" + nanoid();
          pendingIds.current.set(uiMessage.id, pendingId);
        }
        return { ...message, id: pendingId };
      }),
    [uiMessages],
  );

  const isLoading = status === "submitted" || status === "streaming";
  const stop: AiSdkActions["stop"] = () => void stopStreaming();
  const append: AiSdkActions["append"] = ({ content }) =>
    sendMessage({ text: content });
  const reload: AiSdkActions["reload"] = () => regenerate();

  // Hooks to update the Zustand stores
  useChatStoreAiSdkSync(messages, isLoading, stop, append, reload);
  useLessonPlanStoreAiSdkSync(messages, isLoading);

  return null;
}
