"use client";

import React from "react";

import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import Layout from "@/components/AppComponents/Layout";
import { ChatProvider } from "@/components/ContextProviders/ChatProvider";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";

const ChatPageContents = ({ id }: { readonly id: string }) => {
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
