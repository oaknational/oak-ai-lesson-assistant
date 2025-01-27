"use client";

import React from "react";

import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import LessonPlanDisplay from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
import Layout from "@/components/AppComponents/Layout";
import { ChatProvider } from "@/components/ContextProviders/ChatProvider";
import { useReactScan } from "@/hooks/useReactScan";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";
import { useChatStore } from "@/stores/chatStore";
import useStoreReset from "@/stores/chatStore/hooks/useStoreReset";

const ChatPageContents = ({ id }: { readonly id: string }) => {
  useReactScan({ component: LessonPlanDisplay, interval: 10000 });
  const setId = useChatStore((state) => state.setId);
  setId(id);
  useStoreReset({ id });
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
