// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import type {
  ActionDocument,
  BadDocument,
  CommentDocument,
  ErrorDocument,
  MessagePart,
  ModerationDocument,
  PatchDocument,
  PromptDocument,
  StateDocument,
  TextDocument,
  UnknownDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { isSafe } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";
import type { Message } from "ai";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";
import { useChatModeration } from "@/components/ContextProviders/ChatModerationContext";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { Icon } from "@/components/Icon";
import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { cn } from "@/lib/utils";

import type { ModerationModalHelpers } from "../../FeedbackForms/ModerationFeedbackModal";
import type { AilaStreamingStatus } from "../Chat/hooks/useAilaStreamingStatus";
import { isModeration } from "./protocol";

const log = aiLogger("chat");

export interface ChatMessageProps {
  chatId: string; // Needed for when we refactor to use a moderation provider
  message: Message;
  persistedModerations: PersistedModerationBase[];
  lastModeration?: PersistedModerationBase | null;
  separator?: JSX.Element;
  ailaStreamingStatus: AilaStreamingStatus;
  isLastMessage: boolean;
}

export function ChatMessage({
  message,
  persistedModerations,
  separator,
  ailaStreamingStatus,
  isLastMessage,
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
        <div
          className="absolute left-0 top-0 h-20 w-20 "
          onClick={() => {
            setInspect(!inspect);
          }}
        />
        <MessageTextWrapper>
          {message.id !== "working-on-it-initial" &&
            handleTextAndInLineButton({
              messageParts,
              moderationModalHelpers,
              inspect,
              isLastMessage,
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

export interface ChatMessagePartProps {
  part: MessagePart;
  inspect: boolean;
  moderationModalHelpers: ModerationModalHelpers;
  isLastMessage: boolean;
}

function ChatMessagePart({
  part,
  inspect,
  moderationModalHelpers,
  isLastMessage,
}: Readonly<ChatMessagePartProps>) {
  const PartComponent = {
    comment: CommentMessagePart,
    prompt: PromptMessagePart,
    error: ErrorMessagePart,
    bad: BadMessagePart,
    patch: PatchMessagePart,
    state: StateMessagePart,
    text: TextMessagePart,
    action: ActionMessagePart,
    moderation: ModerationMessagePart,
    id: IdMessagePart,
    unknown: UnknownMessagePart,
  }[part.document.type] as React.ComponentType<{
    part: typeof part.document;
    moderationModalHelpers: ModerationModalHelpers;
    isLastMessage: boolean;
  }>;

  if (!PartComponent) {
    log.info("Unknown part type", part.document.type, JSON.stringify(part));
    return null;
  }

  return (
    <div className="w-full">
      <PartComponent
        part={part.document}
        moderationModalHelpers={moderationModalHelpers}
        isLastMessage={isLastMessage}
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CommentMessagePart({ part }: Readonly<{ part: CommentDocument }>) {
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

export const InLineButton = ({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      className="my-6 w-fit rounded-lg border border-black border-opacity-30 bg-white p-7 text-blue"
    >
      {text}
    </button>
  );
};

function TextMessagePart({
  part,
  isLastMessage,
}: Readonly<{ part: TextDocument; isLastMessage: boolean }>) {
  function containsRelevantList(text: string): boolean {
    const relevancePhraseRegex =
      /might\s*be\s*relevant|could\s*be\s*relevant|are\s*relevant/i; // Variations of "might be relevant"
    const numberedListRegex = /\d+\.\s+[A-Za-z0-9]/; // Matches a numbered list like "1. Something"

    return relevancePhraseRegex.test(text) && numberedListRegex.test(text);
  }
  const chat = useLessonChat();
  const { trackEvent } = useAnalytics();
  const lessonPlanTracking = useLessonPlanTracking();

  const { queueUserAction, ailaStreamingStatus } = chat;
  const handleContinue = useCallback(
    async (text: string) => {
      trackEvent("chat:continue");
      lessonPlanTracking.onClickContinue();
      queueUserAction(text);
    },
    [queueUserAction, lessonPlanTracking, trackEvent],
  );

  const shouldTransformToButtons = containsRelevantList(part.value);
  // console.log("******isLastMessage", part.value, isLastMessage);
  if (part.value.includes("Otherwise, tap")) {
    const [userHasSelected, setUserHasSelected] = useState(false);
    return (
      <div className="flex flex-col gap-6">
        <MemoizedReactMarkdownWithStyles
          markdown={part.value.split("Otherwise, tap")[0] ?? part.value}
          shouldTransformToButtons={true}
        />
        {((ailaStreamingStatus === "Idle" &&
          isLastMessage &&
          !userHasSelected) ||
          (ailaStreamingStatus === "Moderating" && isLastMessage)) && (
          <InLineButton
            text={
              part.value.includes("complete the lesson plan") ||
              part.value.includes("final step")
                ? "Proceed to the final step"
                : "Proceed to the next step"
            }
            onClick={() => {
              handleContinue(
                part.value.includes("complete the lesson plan") ||
                  part.value.includes("final step")
                  ? "Proceed to the final step"
                  : "Proceed to the next step",
              );
              setUserHasSelected(true);
            }}
          />
        )}
      </div>
    );
  }
  if (part.value.includes("Tap **Continue")) {
    const [userHasSelected, setUserHasSelected] = useState(false);
    return (
      <div className="flex flex-col gap-6">
        <MemoizedReactMarkdownWithStyles
          markdown={part.value.split("Tap **Continue")[0] ?? part.value}
          shouldTransformToButtons={true}
        />
        {ailaStreamingStatus === "Idle" &&
          isLastMessage &&
          !userHasSelected && (
            <InLineButton
              text={
                part.value.includes("complete the lesson plan") ||
                part.value.includes("final step")
                  ? "Proceed to the final step"
                  : "Proceed to the next step"
              }
              onClick={() => {
                handleContinue(
                  part.value.includes("complete the lesson plan") ||
                    part.value.includes("final step")
                    ? "Proceed to the final step"
                    : "Proceed to the next step",
                );
                setUserHasSelected(true);
              }}
            />
          )}
      </div>
    );
  }
  return (
    <MemoizedReactMarkdownWithStyles
      markdown={part.value}
      shouldTransformToButtons={shouldTransformToButtons}
    />
  );
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UnknownMessagePart({ part }: Readonly<{ part: UnknownDocument }>) {
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

function handleTextAndInLineButton({
  messageParts,
  moderationModalHelpers,
  inspect,
  isLastMessage,
}: {
  messageParts: MessagePart[];
  moderationModalHelpers: ModerationModalHelpers;
  inspect: boolean;
  isLastMessage: boolean;
}) {
  return messageParts.map((part, index) => {
    return (
      <div className="w-full" key={part.id || index}>
        <ChatMessagePart
          part={part}
          moderationModalHelpers={moderationModalHelpers}
          inspect={inspect}
          isLastMessage={isLastMessage}
        />
      </div>
    );
  });
}
