"use client";

import React from "react";
import { scan } from "react-scan";

import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import Layout from "@/components/AppComponents/Layout";
import { ChatProvider } from "@/components/ContextProviders/ChatProvider";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_ENABLE_RENDER_SCAN === "true"
) {
  scan({
    enabled: true,
    log: true,
    report: true,
  });
}
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
