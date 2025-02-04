"use client";

import React from "react";

import { MathJaxContext } from "better-react-mathjax";

import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import LessonPlanDisplay from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
import Layout from "@/components/AppComponents/Layout";
import { ChatProvider } from "@/components/ContextProviders/ChatProvider";
import { useReactScan } from "@/hooks/useReactScan";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";
import { AilaStoresProvider } from "@/stores/AilaStoresProvider";

const ChatPageContents = ({ id }: { readonly id: string }) => {
  useReactScan({ component: LessonPlanDisplay, interval: 10000 });

  return (
    <Layout>
      <MathJaxContext>
        <LessonPlanTrackingProvider chatId={id}>
          <AilaStoresProvider>
            <ChatProvider id={id}>
              <Chat />
            </ChatProvider>
          </AilaStoresProvider>
        </LessonPlanTrackingProvider>
      </MathJaxContext>
    </Layout>
  );
};

export default ChatPageContents;
