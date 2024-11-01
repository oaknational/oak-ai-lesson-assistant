"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { camelCaseToTitleCase } from "@oakai/core/src/utils/camelCaseConversion";
import { OakBox, OakFlex, OakIcon, OakSpan } from "@oaknational/oak-components";
import Link from "next/link";

import { ChatMessage } from "@/components/AppComponents/Chat/chat-message";
import {
  useChatLessonPlan,
  useChatMessages,
  useChatModerations,
  useChatStreaming,
} from "@/components/ContextProviders/ChatProvider";
import type { DemoContextProps } from "@/components/ContextProviders/Demo";

import { useDialog } from "../DialogContext";
import { useProgressForDownloads } from "./Chat/hooks/useProgressForDownloads";
import type { DialogTypes } from "./Chat/types";

export interface ChatListProps {
  isDemoLocked: boolean;
  showLessonMobile: boolean;
  demo: DemoContextProps;
}

function DemoLimitMessage() {
  const { id } = useChatLessonPlan();
  return (
    <div className="w-full flex-col gap-11">
      <ChatMessage
        chatId={id}
        persistedModerations={[]}
        ailaStreamingStatus="Idle"
        message={{
          id: "demo-limit",
          role: "assistant",
          content:
            '{"type": "error", "message": "**Your lesson is complete**\\nYou can no longer edit this lesson. [Create new lesson.](/aila)"}',
        }}
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
  const { messageCount, ailaStreamingStatus } = useChatStreaming();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current && messageCount > 1) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatEndRef, messageCount]);

  useEffect(() => {
    autoScroll && scrollToBottom();
  }, [autoScroll, ailaStreamingStatus, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [showLessonMobile, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [ailaStreamingStatus, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (chatEndRef.current) {
      const isAtBottom =
        chatEndRef.current.getBoundingClientRect().bottom <= window.innerHeight;

      if (isAtBottom) {
        setAutoScroll(true);
      } else {
        setAutoScroll(false);
      }
    }
  }, [chatEndRef, setAutoScroll]);

  if (!messageCount) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col " onScroll={handleScroll}>
      <ChatMessagesDisplay demo={demo} />

      {isDemoLocked && <DemoLimitMessage />}
      <div ref={chatEndRef} />
    </div>
  );
}

export const ChatMessagesDisplay = ({ demo }: { demo: DemoContextProps }) => {
  const { isStreaming, streamingSection, ailaStreamingStatus } =
    useChatStreaming();
  const { lastModeration, initialModerations: persistedModerations } =
    useChatModerations();
  const { id, lessonPlan } = useChatLessonPlan();
  const { messages } = useChatMessages();
  const { setDialogWindow } = useDialog();
  const { totalSections, totalSectionsComplete } = useProgressForDownloads({
    lessonPlan,
    isStreaming,
  });

  const workingOnItMessage =
    streamingSection &&
    !["title", "subject", "keyStage", "topic"].includes(streamingSection)
      ? `Editing ${camelCaseToTitleCase(streamingSection)}…`
      : "Working on it…";

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
                persistedModerations={[]}
                separator={<span className="my-10 flex" />}
                ailaStreamingStatus={ailaStreamingStatus}
              />
              <ChatMessage
                key={`${message.id}-working`}
                chatId={id}
                message={{
                  id: "working-on-it-initial",
                  role: "assistant",
                  content: workingOnItMessage,
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
                      content: workingOnItMessage,
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
                content: workingOnItMessage,
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
  const handleShareButtonClick = useCallback(() => {
    if (demo.isSharingEnabled) {
      setDialogWindow("share-chat");
    } else {
      setDialogWindow("demo-share-locked");
    }
  }, [setDialogWindow, demo]);

  const handleDownloadClick = useCallback(() => {
    if (!demo.isSharingEnabled) {
      setDialogWindow("demo-share-locked");
    }
  }, [setDialogWindow, demo]);
  return (
    <OakFlex $flexDirection="column" $gap="all-spacing-7" $mv="space-between-l">
      {demo.isSharingEnabled && (
        <Link
          href={demo.isSharingEnabled ? `/aila/download/${id}` : "#"}
          onClick={handleDownloadClick}
        >
          <InnerInChatButton iconName="download">Download</InnerInChatButton>
        </Link>
      )}
      <button
        onClick={handleShareButtonClick}
        data-testid="in-chat-share-button"
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
