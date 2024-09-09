// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx
import { ReactNode, useState } from "react";

import {
  ActionDocument,
  BadDocument,
  ErrorDocument,
  MessagePart,
  ModerationDocument,
  PatchDocument,
  PromptDocument,
  StateDocument,
  TextDocument,
  parseMessageParts,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { isSafe } from "@oakai/core/src/utils/ailaModeration/helpers";
import { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { Message } from "ai";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";
import { useChatModeration } from "@/components/ContextProviders/ChatModerationContext";
import { cn } from "@/lib/utils";

import { ModerationModalHelpers } from "../../FeedbackForms/ModerationFeedbackModal";
import { AilaStreamingStatus } from "../Chat/hooks/useAilaStreamingStatus";
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
            <aside className="pt-3 text-sm">
              <span className="font-bold">Sensitive content:</span> View{" "}
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
                content guidance
              </a>
            </aside>
          </MessageTextWrapper>
        </MessageWrapper>
      )}
      <MessageWrapper
        errorType={hasError ? "generic" : null}
        type={getAvatarType()}
      >
        <div
          className="absolute left-0 top-0 h-20 w-20 "
          onClick={() => {
            setInspect(!inspect);
          }}
        />
        <MessageTextWrapper>
          {message.id !== "working-on-it-initial" &&
            messageParts.map((part, index) => {
              return (
                <div className="w-full" key={index}>
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
  return (
    <div
      className={cn(
        "relative mt-14 w-full items-start rounded-md",
        errorType && ERROR_TYPE_COLOR_MAP[errorType],
        errorType && "p-9",
        className,
        type === "user" && "bg-teachersLilac p-9",
      )}
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

export interface ChatMessagePartProps {
  part: MessagePart;
  inspect: boolean;
  moderationModalHelpers: ModerationModalHelpers;
}

function ChatMessagePart({
  part,
  inspect,
  moderationModalHelpers,
}: Readonly<ChatMessagePartProps>) {
  const PartComponent = {
    prompt: PromptMessagePart,
    error: ErrorMessagePart,
    bad: BadMessagePart,
    patch: PatchMessagePart,
    state: StateMessagePart,
    text: TextMessagePart,
    action: ActionMessagePart,
    moderation: ModerationMessagePart,
    id: IdMessagePart,
  }[part.document.type];

  if (!PartComponent) {
    console.log("Unknown part type", part.document.type, part); // eslint-disable-line no-console
    return null;
  }

  return (
    <div className="w-full">
      <PartComponent
        part={part.document}
        moderationModalHelpers={moderationModalHelpers}
      />

      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        inspect && <PartInspector part={part} />
      }
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BadMessagePart({ part }: Readonly<{ part: BadDocument }>) {
  return null;
}

function PromptMessagePart({ part }: Readonly<{ part: PromptDocument }>) {
  return <MemoizedReactMarkdownWithStyles markdown={part.message} />;
}

function ModerationMessagePart({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  part,
}: Readonly<{ part: ModerationDocument }>) {
  return null;
}

function ErrorMessagePart({
  part,
}: Readonly<{
  part: ErrorDocument;
}>) {
  const markdown = part.message || "Sorry, an error has occurred";
  return <MemoizedReactMarkdownWithStyles markdown={markdown} />;
}

function TextMessagePart({ part }: Readonly<{ part: TextDocument }>) {
  return <MemoizedReactMarkdownWithStyles markdown={part.value} />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PatchMessagePart({ part }: Readonly<{ part: PatchDocument }>) {
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StateMessagePart({ part }: Readonly<{ part: StateDocument }>) {
  return null;
}

function IdMessagePart() {
  return null;
}

function ActionMessagePart({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  part,
}: Readonly<{ part: ActionDocument }>) {
  return null;
}

function PartInspector({ part }: Readonly<{ part: MessagePart }>) {
  return (
    <div className="w-full bg-gray-200 px-8 py-16">
      <pre className="w-full text-wrap text-xs">
        {JSON.stringify(part, null, 2)}
      </pre>
    </div>
  );
}
