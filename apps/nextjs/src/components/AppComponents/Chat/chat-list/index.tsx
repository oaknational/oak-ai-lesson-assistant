"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import scrollIntoView from "scroll-into-view-if-needed";

import { ChatMessage } from "@/components/AppComponents/Chat/chat-message";
import { Message } from "@/components/AppComponents/Chat/chat-message/layout";
import { useChatStore } from "@/stores/AilaStoresProvider";

import { DemoLimitMessage } from "./demo-limit-message";
import {
  InChatDownloadButtons,
  useShowDownloadButtons,
} from "./in-chat-download-buttons";
import { WorkingOnItMessage } from "./working-on-it-message";

export interface ChatListProps {
  isDemoLocked: boolean;
  showLessonMobile: boolean;
}
export function ChatList({
  isDemoLocked,
  showLessonMobile,
}: Readonly<ChatListProps>) {
  const hasMessages = useChatStore(
    (state) => state.stableMessages.length > 0 || !!state.streamingMessage,
  );
  const hasResponses = useChatStore((state) => state.stableMessages.length > 1);

  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  // NOTE: This is a similar (and better?) approach to the chat store/s scrolling with chatAreaRef
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

  const shouldShowDownloadButtons = useShowDownloadButtons();

  if (!hasMessages) {
    return null;
  }

  return (
    <div className="relative flex w-full flex-col" onScroll={handleScroll}>
      <StableMessages />
      <StreamingMessage />
      {shouldShowDownloadButtons && <InChatDownloadButtons />}
      {isDemoLocked && <DemoLimitMessage />}
      <div ref={chatEndRef} />
    </div>
  );
}

const StableMessages = () => {
  const stableMessages = useChatStore((state) => state.stableMessages);

  return (
    <>
      {stableMessages.map((message) => (
        <Message.Spacing key={message.id}>
          <ChatMessage message={message} />
        </Message.Spacing>
      ))}
    </>
  );
};

// NOTE: We isolate streamingMessage to reduce rerenders in other components during streaming
const StreamingMessage = () => {
  const message = useChatStore((state) => state.streamingMessage);
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  // Don't show any text content from the response until part streaming has finished
  // Note that this prevents us from showing any text ahead of patches
  const shouldShowWorkingOnIt =
    ailaStreamingStatus !== "Idle" && ailaStreamingStatus !== "Moderating";

  if (shouldShowWorkingOnIt) {
    return (
      <Message.Spacing>
        <WorkingOnItMessage />
      </Message.Spacing>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <Message.Spacing>
      <ChatMessage key={message.id} message={message} />
    </Message.Spacing>
  );
};
