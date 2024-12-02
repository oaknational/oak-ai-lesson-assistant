// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx
import type { ReactNode } from "react";
import { useState } from "react";

import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { isSafe } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Message } from "ai";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";
import { useChatModeration } from "@/components/ContextProviders/ChatModerationContext";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

import type { AilaStreamingStatus } from "../Chat/hooks/useAilaStreamingStatus";
import { ChatMessagePart } from "./ChatMessagePart";
import { isModeration } from "./protocol";

export interface ChatMessageProps {
  chatId: string; // Needed for when we refactor to use a moderation provider
  message: Message;
  persistedModerations: PersistedModerationBase[];
  lastModeration?: PersistedModerationBase | null;
  separator?: JSX.Element;
  ailaStreamingStatus: AilaStreamingStatus;
}

export function ChatMessage({
  message,
  persistedModerations,
  separator,
  ailaStreamingStatus,
}: Readonly<ChatMessageProps>) {
  const { moderationModalHelpers } = useChatModeration();

  const messageParts: MessagePart[] =
    message.role === "user" || message.id === "working-on-it-initial"
      ? [
          {
            type: "message-part",
            id: "working-on-it-initial",
            document: { type: "text", value: message.content },
            isPartial: false,
          },
        ]
      : parseMessageParts(message.content);

  const hasError = messageParts.some((part) => part.document.type === "error");
  const [inspect, setInspect] = useState(false);

  const isEditing =
    ailaStreamingStatus !== "Idle" &&
    (messageParts.some((part) => part.isPartial) ||
      messageParts.filter((part) =>
        ["bad", "text", "prompt"].includes(part.document.type),
      ).length === 0);

  const moderationMessagePart: PersistedModerationBase | undefined =
    messageParts.find((m) => isModeration(m.document) && m.document?.id)
      ?.document as PersistedModerationBase | undefined;

  const messageId = message.id;

  const matchingPersistedModeration: PersistedModerationBase | undefined =
    persistedModerations.find((m) => m.messageId === messageId);

  const matchingModeration =
    matchingPersistedModeration ?? moderationMessagePart;

  if (messageParts.every((part) => part.document.type === "action")) {
    return null;
  }

  function getAvatarType() {
    if (message.role === "user") {
      return "user";
    }

    if (hasError) {
      return "warning";
    }

    if (isEditing) {
      return "editing";
    }

    return "aila";
  }

  return (
    <>
      {separator}

      {matchingModeration && !isSafe(matchingModeration) && (
        <MessageWrapper errorType="moderation" type={getAvatarType()}>
          <MessageTextWrapper>
            <div className="flex items-center">
              <Icon icon="warning" size="sm" className="mr-6" />
              <aside className="pt-3 text-sm">
                <a
                  href="#"
                  onClick={() => {
                    moderationModalHelpers.openModal({
                      moderation: matchingModeration,
                      closeModal: moderationModalHelpers.closeModal,
                    });
                  }}
                  className="underline"
                >
                  View content guidance
                </a>
              </aside>
            </div>
          </MessageTextWrapper>
        </MessageWrapper>
      )}
      <MessageWrapper
        errorType={hasError ? "generic" : null}
        type={getAvatarType()}
      >
        <button
          className="absolute left-0 top-0 h-20 w-20"
          onClick={() => {
            setInspect(!inspect);
          }}
        />
        <MessageTextWrapper>
          {message.id !== "working-on-it-initial" &&
            messageParts.map((part) => {
              return (
                <div className="w-full" key={part.id}>
                  <ChatMessagePart
                    part={part}
                    moderationModalHelpers={moderationModalHelpers}
                    inspect={inspect}
                  />
                </div>
              );
            })}

          {message.id === "working-on-it-initial" && (
            <div className="w-full animate-pulse">
              {ailaStreamingStatus === "StreamingChatResponse" ||
              ailaStreamingStatus === "Moderating" ? (
                <MemoizedReactMarkdownWithStyles markdown={"Finishing up..."} />
              ) : (
                <MemoizedReactMarkdownWithStyles
                  markdown={"Working on it ..."}
                />
              )}
            </div>
          )}
        </MessageTextWrapper>
      </MessageWrapper>
    </>
  );
}

const ERROR_TYPE_COLOR_MAP = {
  generic: "bg-peachCream",
  moderation: "bg-videoBlue",
};

type MessageWrapperProps = Readonly<{
  className?: string;
  errorType: "generic" | "moderation" | null;
  children: ReactNode;
  type: "user" | "editing" | "warning" | "moderation" | "aila";
}>;
function MessageWrapper({
  className,
  errorType,
  children,
  type,
}: MessageWrapperProps) {
  const testId = errorType
    ? `chat-message-wrapper-${type}-${errorType}`
    : `chat-message-wrapper-${type}`;
  return (
    <div
      className={cn(
        "relative mt-14 w-full items-start rounded-md",
        type === "user" && "bg-teachersLilac p-9",
        errorType && ERROR_TYPE_COLOR_MAP[errorType],
        errorType && "p-9",
        className,
      )}
      data-testid={testId}
    >
      {type === "aila" ||
        (type === "editing" && (
          <span className="block font-bold sm:hidden">Aila: </span>
        ))}
      {children}
    </div>
  );
}

function MessageTextWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className=" flex w-full flex-col items-start justify-between">
      {children}
    </div>
  );
}
