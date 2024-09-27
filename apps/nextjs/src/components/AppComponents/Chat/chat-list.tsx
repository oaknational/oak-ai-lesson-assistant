"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { OakBox, OakFlex, OakIcon, OakSpan } from "@oaknational/oak-components";
import { Message } from "ai";
import Link from "next/link";

import { ChatMessage } from "@/components/AppComponents/Chat/chat-message";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { DemoContextProps } from "@/components/ContextProviders/Demo";

import { useDialog } from "../DialogContext";
import { AilaStreamingStatus } from "./Chat/hooks/useAilaStreamingStatus";
import { useProgressForDownloads } from "./Chat/hooks/useProgressForDownloads";
import { DialogTypes } from "./Chat/types";

export interface ChatListProps {
  isDemoLocked: boolean;
  showLessonMobile: boolean;
  demo: DemoContextProps;
}

function DemoLimitMessage({ id }: Readonly<{ id: string }>) {
  return (
    <div className="w-full flex-col gap-11">
      <ChatMessage
        chatId={id}
        ailaStreamingStatus="Idle"
        message={{
          id: "demo-limit",
          role: "assistant",
          content: `{"type": "error", "message": "**Your lesson is complete**\\nYou can no longer edit this lesson. [Create new lesson.](/aila)"}`,
        }}
        persistedModerations={[]}
        separator={<span className="my-10 flex" />}
      />
    </div>
  );
}

export function ChatList({
  isDemoLocked,
  showLessonMobile,
  demo,
}: Readonly<ChatListProps>) {
  const chat = useLessonChat();

  const { id, messages, ailaStreamingStatus, lastModeration } = chat;
  const persistedModerations = chat.initialModerations;

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current && messages.length > 1) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatEndRef, messages]);

  useEffect(() => {
    autoScroll && scrollToBottom();
  }, [messages, autoScroll, ailaStreamingStatus, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [showLessonMobile, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [ailaStreamingStatus, messages, scrollToBottom]);

  const handleScroll = () => {
    if (chatEndRef.current) {
      const isAtBottom =
        chatEndRef.current.getBoundingClientRect().bottom <= window.innerHeight;

      if (isAtBottom) {
        setAutoScroll(true);
      } else {
        setAutoScroll(false);
      }
    }
  };

  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col " onScroll={handleScroll}>
      <ChatMessagesDisplay
        messages={messages}
        id={id}
        lastModeration={lastModeration}
        persistedModerations={persistedModerations}
        ailaStreamingStatus={ailaStreamingStatus}
        demo={demo}
      />

      {isDemoLocked && <DemoLimitMessage id={id} />}
      <div ref={chatEndRef} />
    </div>
  );
}

export const ChatMessagesDisplay = ({
  messages,
  id,
  lastModeration,
  persistedModerations = [],
  ailaStreamingStatus,
  demo,
}: {
  id: string;
  messages: Message[];
  lastModeration: PersistedModerationBase | null;
  persistedModerations: PersistedModerationBase[];
  ailaStreamingStatus: AilaStreamingStatus;
  demo: DemoContextProps;
}) => {
  const { lessonPlan, isStreaming } = useLessonChat();
  const { setDialogWindow } = useDialog();
  const { totalSections, totalSectionsComplete } = useProgressForDownloads({
    lessonPlan,
    isStreaming,
  });

  return (
    <>
      {messages.map((message) => {
        // Check if the most recent message in the messages array is from the role user if so add a working on it message

        if (messages.length === 1) {
          return (
            <div
              key={`${message.id}-container`}
              className="w-full flex-col gap-11"
            >
              <ChatMessage
                key={message.id}
                chatId={id}
                message={message}
                lastModeration={lastModeration}
                persistedModerations={persistedModerations}
                ailaStreamingStatus={ailaStreamingStatus}
                separator={<span className="my-10 flex" />}
              />
              <ChatMessage
                key={`${message.id}-working`}
                chatId={id}
                message={{
                  id: "working-on-it-initial",
                  role: "assistant",
                  content: "Working on it…",
                }}
                lastModeration={lastModeration}
                persistedModerations={[]}
                separator={<span className="my-10 flex" />}
                ailaStreamingStatus={ailaStreamingStatus}
              />
            </div>
          );
        }
        return (
          <div
            key={`${message.id}-container`}
            className="w-full flex-col gap-11"
          >
            <ChatMessage
              key={message.id}
              chatId={id}
              ailaStreamingStatus={ailaStreamingStatus}
              message={
                !["Moderating", "Idle"].includes(ailaStreamingStatus) &&
                message.role === "assistant" &&
                messages !== undefined &&
                message.id === (messages?.[messages?.length - 1]?.id ?? "")
                  ? {
                      id: "working-on-it-initial",
                      role: "assistant",
                      content: "Working on it…",
                    }
                  : message
              }
              lastModeration={lastModeration}
              persistedModerations={
                ailaStreamingStatus !== "Idle" ? [] : persistedModerations
              }
              separator={<span className="my-10 flex" />}
            />
          </div>
        );
      })}

      {messages[messages.length - 1]?.role === "user" &&
        0 !== messages.length - 1 && (
          <div className="w-full flex-col gap-11">
            <ChatMessage
              chatId={id}
              ailaStreamingStatus={ailaStreamingStatus}
              message={{
                id: "working-on-it-initial",
                role: "assistant",
                content: "Working on it…",
              }}
              lastModeration={lastModeration}
              persistedModerations={[]}
              separator={<span className="my-10 flex" />}
            />
          </div>
        )}
      {totalSectionsComplete >= totalSections &&
        messages.some(
          (message) =>
            (message.role !== "user" &&
              message.content.includes("download") &&
              message.content.includes("slides")) ||
            (message.role !== "user" &&
              message.content.includes("download") &&
              message.content.includes("share")),
        ) && <InChatDownloadButtons {...{ demo, id, setDialogWindow }} />}
    </>
  );
};

const InChatDownloadButtons = ({
  demo,
  id,
  setDialogWindow,
}: {
  demo: DemoContextProps;
  id: string;
  setDialogWindow: Dispatch<SetStateAction<DialogTypes>>;
}) => {
  return (
    <OakFlex $flexDirection="column" $gap="all-spacing-7" $mv="space-between-l">
      {demo.isSharingEnabled && (
        <Link
          href={demo.isSharingEnabled ? `/aila/download/${id}` : "#"}
          onClick={() => {
            if (!demo.isSharingEnabled) {
              setDialogWindow("demo-share-locked");
            }
          }}
        >
          <InnerInChatButton iconName="download">Download</InnerInChatButton>
        </Link>
      )}
      <button
        onClick={() => {
          if (demo.isSharingEnabled) {
            setDialogWindow("share-chat");
          } else {
            setDialogWindow("demo-share-locked");
          }
        }}
      >
        <InnerInChatButton iconName="share">Share</InnerInChatButton>
      </button>
    </OakFlex>
  );
};

const InnerInChatButton = ({
  iconName,

  children,
}: {
  iconName: "download" | "share";

  children: string;
}) => {
  return (
    <OakFlex
      $pa="inner-padding-m"
      $gap="all-spacing-3"
      $background="white"
      $borderRadius="border-radius-m"
      $alignItems="center"
      $dropShadow="drop-shadow-standard"
    >
      <OakBox $transform="scale">
        <OakIcon iconName={iconName} $width="all-spacing-7" />
      </OakBox>
      <OakSpan $font="body-2">{children}</OakSpan>
    </OakFlex>
  );
};
