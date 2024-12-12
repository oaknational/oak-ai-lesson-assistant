"use client";

import React from "react";

import { useReactScan } from "hooks/useReactScan";

import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import LessonPlanDisplay from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
import ChatRightHandSideLesson from "@/components/AppComponents/Chat/chat-right-hand-side-lesson";
import Layout from "@/components/AppComponents/Layout";
import { ChatProvider } from "@/components/ContextProviders/ChatProvider";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";

const ChatPageContents = ({ id }: { readonly id: string }) => {
  useReactScan(LessonPlanDisplay, 5000);

  return (
    <Layout>
      <LessonPlanTrackingProvider chatId={id}>
        <ChatProvider id={id}>
          <Chat />
        </ChatProvider>
      </LessonPlanTrackingProvider>
    </Layout>
  );
};

export default ChatPageContents;
