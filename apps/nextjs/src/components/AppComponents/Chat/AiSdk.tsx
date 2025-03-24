import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import { useChat } from "ai/react";
import { nanoid } from "nanoid";
import { usePathname } from "next/navigation";
import { useChatStoreAiSdkSync } from "src/stores/chatStore/hooks/useChatStoreAiSdkSync";
import { useLessonPlanStoreAiSdkSync } from "src/stores/lessonPlanStore/hooks/useLessonPlanStoreAiSdkSync";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";

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

export function AiSdk({ id }: Readonly<AiSdkProps>) {
  const path = usePathname();
  const [hasFinished, setHasFinished] = useState(true);

  const initialMessages = useChatStore((state) => state.initialMessages);
  const streamingFinished = useChatStore((state) => state.streamingFinished);
  const scrollToBottom = useChatStore((state) => state.scrollToBottom);
  const messageStarted = useLessonPlanStore((state) => state.messageStarted);
  const messageFinished = useLessonPlanStore((state) => state.messageFinished);

  // TODO: move to chat store
  const { invokeActionMessages } = useActionMessages();

  const {
    messages,
    append,
    reload,
    stop: stopStreaming,
    isLoading,
    data,
  } = useChat({
    sendExtraMessageFields: true,
    // NOTE: these initial messages are used by the chat endpoint
    initialMessages,
    generateId: () => generateMessageId({ role: "user" }),
    id,
    body: {
      id,
      options: {
        useRag: true,
        temperature: 0.7,
      },
    },
    fetch(input: RequestInfo | URL, init?: RequestInit | undefined) {
      messageStarted();
      return fetch(input, init);
    },
    onError(error) {
      Sentry.captureException(new Error("Use chat error"), {
        extra: { originalError: error },
      });
      console.error(error);
      log.error("UseChat error", { error, messages });
      setHasFinished(true);
    },
    onResponse(response) {
      log.info("Chat: On Response");

      // TODO: create onResponse handler in store and call from there
      scrollToBottom();

      if (response.status === 401) {
        toast.error(response.statusText);
        setHasFinished(true);
      }
      if (hasFinished) {
        setHasFinished(false);
      }
      if (!path?.includes("chat/[id]")) {
        window.history.pushState({}, "", `/aila/${id}`);
      }
    },
    onFinish(response) {
      log.info("Chat: On Finish", new Date().toISOString(), {
        response,
        path,
      });

      invokeActionMessages(response.content);

      setHasFinished(true);
      streamingFinished();
      messageFinished();
    },
  });
  log.info("ai sdk data", data);
  log.info(messages[messages.length - 1]);

  useEffect(() => {
    /**
     * This is a hack to ensure that the assistant messages have a stable id
     * across server and client.
     * We should move away from this either when the vercel/ai package supports it
     * natively, or when we move away from streaming.
     */
    return messages.forEach((message) => {
      if (message.role !== "assistant") {
        return;
      }

      const idIsStable = message.id.startsWith("a-");
      if (idIsStable) {
        return;
      }

      const idFromContent = findMessageIdFromContent(message);
      if (idFromContent) {
        message.id = idFromContent;
        return;
      }

      message.id = "TEMP_PENDING_" + nanoid();
    });
  }, [messages]);

  // Hooks to update the Zustand stores
  useChatStoreAiSdkSync(messages, isLoading, stopStreaming, append, reload);
  useLessonPlanStoreAiSdkSync(messages, isLoading);

  return null;
}

// {"response":"llmMessage",
//   "patches":[
//     {"type":"patch","reasoning":"There are no existing Oak lessons for this topic, so I've started a new lesson from scratch. I've added a learning outcome for the lesson.","value":{"op":"add","path":"/learningOutcome","value":"I can explain the reasons for the end of Roman rule in Britain."}},
//     {"type":"patch","reasoning":"Added learning cycles to break down the lesson into manageable parts for pupils.","value":{"op":"add","path":"/learningCycles","value":["Identify the key events leading to the end of Roman rule in Britain","Explain the impact of the Roman withdrawal on British society","Discuss the role of archaeology in understanding this historical period"]}
//   }],
//   "prompt":{"type":"text","message":"Are the learning outcome and learning cycles appropriate for your pupils? If not, suggest an edit. Otherwise, tap **Continue** to move on to the next step."}
// }
