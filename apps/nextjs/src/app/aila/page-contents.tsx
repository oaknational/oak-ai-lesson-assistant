"use client";

import React from "react";

import { Moderation } from "@oakai/db";
import { type Message } from "ai/react";

import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import Layout from "@/components/AppComponents/Layout";
import { ChatProvider } from "@/components/ContextProviders/ChatProvider";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";

const ChatPageContents = ({
  id,
  isShared,
  startingMessage,
  initialMessages,
  initialLessonPlan,
  initialModerations,
}: {
  startingMessage?: string;
  initialMessages?: Message[];
  initialLessonPlan?: object;
  id: string;
  isShared: boolean | undefined;
  initialModerations: Moderation[];
}) => {
  return (
    <Layout>
      <LessonPlanTrackingProvider chatId={id}>
        <ChatProvider
          key={`chat-${id}`}
          id={id}
          initialMessages={initialMessages}
          initialLessonPlan={initialLessonPlan}
          initialModerations={initialModerations}
          startingMessage={startingMessage}
        >
          <Chat isShared={isShared} />
        </ChatProvider>
      </LessonPlanTrackingProvider>
    </Layout>
  );
};

export default ChatPageContents;
