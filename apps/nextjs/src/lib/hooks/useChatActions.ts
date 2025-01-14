import toast from "react-hot-toast";

import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import logger from "@oakai/logger/structuredLogger";
import { useChat, type Message } from "ai/react";
import { useChatStore } from "store/useChatStores";
import { useLessonPlanStore } from "store/useLessonPlanStore";
import { useModerationStore } from "store/useModerationStore";

import { isModeration } from "@/components/AppComponents/Chat/chat-message/protocol";

export const useChatActions = () => {
  const chatStore = useChatStore();
  const lessonPlanStore = useLessonPlanStore();
  const moderationStore = useModerationStore();

  const {
    messages,
    append,
    reload,
    stop: stopStreaming,
    isLoading,
    input,
    setInput,
    setMessages,
  } = useChat({
    id: chatStore.id,
    initialMessages: chatStore.chat?.messages.filter((m) =>
      isValidMessageRole(m.role),
    ) as Message[],
    sendExtraMessageFields: true,
    generateId: () => generateMessageId({ role: "user" }),
    body: {
      id: chatStore.id,
      lessonPlan: chatStore.chat?.lessonPlan,
      options: {
        useRag: true,
        temperature: 0.7,
      },
    },
    onResponse: (response) => {
      chatStore.chatAreaRef?.current?.scrollTo(
        0,
        chatStore.chatAreaRef.current.scrollHeight,
      );
      if (response.status === 401) {
        toast.error(response.statusText);
        chatStore.setHasFinished(true);
      }
      chatStore.setHasFinished(false);
    },
    onFinish: (response) => {
      const messageModeration = getModerationFromMessage(response);
      if (messageModeration?.id) {
        moderationStore.setLastModeration({
          categories: messageModeration.categories,
          id: messageModeration.id,
        });
      }

      chatStore.setHasFinished(true);
    },
  });

  // Action handlers
  const executeQueuedAction = async () => {
    if (!chatStore.queuedUserAction || !chatStore.hasFinished) return;

    const action = chatStore.queuedUserAction;
    chatStore.clearQueuedAction();

    try {
      if (action === "continue") {
        await append({
          content: "Continue",
          role: "user",
        });
      } else if (action === "regenerate") {
        reload();
      } else {
        await append({
          content: action,
          role: "user",
        });
      }
    } catch (error) {
      logger.error("Error handling queued action:", error);
    }
  };

  const stop = () => {
    if (chatStore.queuedUserAction) {
      chatStore.clearQueuedAction();
    } else {
      stopStreaming();
    }
  };

  return {
    messages,
    append,
    reload,
    stop,
    executeQueuedAction,
  };
};

function getModerationFromMessage(message?: { content: string }) {
  if (!message) {
    return;
  }
  const messageParts = parseMessageParts(message.content);
  const moderation = messageParts.map((p) => p.document).find(isModeration);

  return moderation;
}

function isValidMessageRole(role: unknown): role is Message["role"] {
  return (
    typeof role === "string" &&
    ["system", "assistant", "user", "data"].includes(role)
  );
}
