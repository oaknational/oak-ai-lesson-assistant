"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Message } from "ai";

import { ChatMessage } from "@/components/AppComponents/Chat/chat-message";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import type { DemoContextProps } from "@/components/ContextProviders/Demo";

import type { AilaStreamingStatus } from "../Chat/hooks/useAilaStreamingStatus";
import { useProgressForDownloads } from "../Chat/hooks/useProgressForDownloads";
import { sectionTitle } from "../drop-down-section";
import { DemoLimitMessage } from "./demo-limit-message";
import { InChatDownloadButtons } from "./in-chat-download-buttons";

export interface ChatListProps {
  isDemoLocked: boolean;
  showLessonMobile: boolean;
  demo: DemoContextProps;
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
    <div className="relative flex w-full flex-col" onScroll={handleScroll}>
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

export type ChatMessagesDisplayProps = Readonly<{
  id: string;
  messages: Message[];
  lastModeration: PersistedModerationBase | null;
  persistedModerations: PersistedModerationBase[];
  ailaStreamingStatus: AilaStreamingStatus;
  demo: DemoContextProps;
}>;

export const ChatMessagesDisplay = ({
  messages,
  id,
  lastModeration,
  persistedModerations = [],
  ailaStreamingStatus,
  demo,
}: ChatMessagesDisplayProps) => {
  const { lessonPlan, isStreaming, streamingSection } = useLessonChat();
  const { totalSections, totalSectionsComplete } = useProgressForDownloads({
    lessonPlan,
    isStreaming,
  });

  const workingOnItMessage = streamingSection
    ? `Editing ${sectionTitle(streamingSection).toLowerCase()}…`
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
        ) && <InChatDownloadButtons {...{ demo, id }} />}
    </>
  );
};
