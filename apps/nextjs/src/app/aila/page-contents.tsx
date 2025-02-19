"use client";

import React from "react";

import { AiSdk } from "@/components/AppComponents/Chat/AiSdk";
import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import LessonPlanDisplay from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
import Layout from "@/components/AppComponents/Layout";
import { useReactScan } from "@/hooks/useReactScan";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";
import { AilaStoresProvider } from "@/stores/AilaStoresProvider";

const ChatPageContents = ({ id }: { readonly id: string }) => {
  useReactScan({ component: LessonPlanDisplay, interval: 10000 });

  return (
    <Layout>
      <LessonPlanTrackingProvider chatId={id}>
        <AilaStoresProvider id={id}>
          <AiSdk id={id} />
          <Chat />
        </AilaStoresProvider>
      </LessonPlanTrackingProvider>
    </Layout>
  );
};

export default ChatPageContents;
