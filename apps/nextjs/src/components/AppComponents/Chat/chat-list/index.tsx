"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import scrollIntoView from "scroll-into-view-if-needed";

import {
  ChatMessage,
  MessageTextWrapper,
  MessageWrapper,
} from "@/components/AppComponents/Chat/chat-message";
import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";

import { useProgressForDownloads } from "../Chat/hooks/useProgressForDownloads";
import { MemoizedReactMarkdownWithStyles } from "../markdown";
import { DemoLimitMessage } from "./demo-limit-message";
import { InChatDownloadButtons } from "./in-chat-download-buttons";

const Separator = () => <span className="my-10 flex" />;

const useShowDownloadButtons = () => {
  const stableMessages = useChatStore((state) => state.stableMessages);
  const lessonPlan = useLessonPlanStore((state) => state.lessonPlan);
  const isStreaming = useChatStore(
    (state) => state.ailaStreamingStatus !== "Idle",
  );

  const { totalSections, totalSectionsComplete } = useProgressForDownloads({
    lessonPlan,
    isStreaming,
  });

  if (totalSectionsComplete < totalSections) {
    return stableMessages.some(
      ({ role, content }) =>
        role !== "user" &&
        content.includes("download") &&
        (content.includes("slides") || content.includes("share")),
    );
  }
};

export interface ChatListProps {
  isDemoLocked: boolean;
  showLessonMobile: boolean;
}
export function ChatList({
  isDemoLocked,
  showLessonMobile,
}: Readonly<ChatListProps>) {
  const id = useLessonPlanStore((state) => state.id);
  const hasMessages = useChatStore(
    (state) => state.stableMessages.length > 0 || !!state.streamingMessage,
  );
  const hasResponses = useChatStore((state) => state.stableMessages.length > 1);

  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  // NOTE: This is a similar (and better?) apprach to the chat store/s scrolling with chatAreaRef
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current && hasResponses) {
      // Use ponyfill for safari support
      scrollIntoView(chatEndRef.current, { behavior: "smooth" });
    }
  }, [chatEndRef, hasResponses]);

  useEffect(() => {
    autoScroll && scrollToBottom();
  }, [hasResponses, autoScroll, ailaStreamingStatus, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [showLessonMobile, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [ailaStreamingStatus, hasResponses, scrollToBottom]);

  const shouldShowDownloadButtons = useShowDownloadButtons();

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

  if (!hasMessages) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col" onScroll={handleScroll}>
      <StableMessages />
      <StreamingMessage />
      <WorkingOnItMessage />
      {shouldShowDownloadButtons && <InChatDownloadButtons />}
      {isDemoLocked && <DemoLimitMessage id={id} />}
      <div ref={chatEndRef} />
    </div>
  );
}

const StableMessages = () => {
  const stableMessages = useChatStore((state) => state.stableMessages);

  return (
    <>
      {stableMessages.map((message) => (
        <>
          <Separator />
          <ChatMessage key={message.id} message={message} />
        </>
      ))}
    </>
  );
};

// NOTE: We isolate streamingMessage to reduce rerenders in other components during streaming
const StreamingMessage = () => {
  const message = useChatStore((state) => state.streamingMessage);
  if (!message) {
    return null;
  }

  return (
    <>
      <Separator />
      <ChatMessage message={message} />
    </>
  );
};

const WorkingOnItMessage = () => {
  const streamingMessage = useChatStore((state) => state.streamingMessage);
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  const shouldShow =
    streamingMessage &&
    (streamingMessage.role === "user" ||
      !streamingMessage.parts.some((part) => part.document.type === "text"));

  const isFinishingUp =
    ailaStreamingStatus === "StreamingChatResponse" ||
    ailaStreamingStatus === "Moderating";
  const text = isFinishingUp ? "Finishing up…" : "Working on it …";

  if (shouldShow) {
    return (
      <>
        <Separator />

        <MessageWrapper>
          <MessageTextWrapper>
            <div className="w-full animate-pulse">
              <MemoizedReactMarkdownWithStyles markdown={text} />
            </div>
          </MessageTextWrapper>
        </MessageWrapper>
      </>
    );
  }

  return null;
};
