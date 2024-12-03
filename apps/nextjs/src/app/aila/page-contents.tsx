"use client";

import React from "react";

import { MathJaxContext } from "better-react-mathjax";

import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import Layout from "@/components/AppComponents/Layout";
import { ChatProvider } from "@/components/ContextProviders/ChatProvider";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";

const ChatPageContents = ({ id }: { readonly id: string }) => {
  return (
    <Layout>
      <MathJaxContext>
        <LessonPlanTrackingProvider chatId={id}>
          <ChatProvider key={`chat-${id}`} id={id}>
            <Chat />
          </ChatProvider>
        </LessonPlanTrackingProvider>
      </MathJaxContext>
    </Layout>
  );
};

export default ChatPageContents;
