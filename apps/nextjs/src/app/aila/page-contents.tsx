"use client";

import React, { useEffect } from "react";

import { AiSdk } from "@/components/AppComponents/Chat/AiSdk";
import { Chat } from "@/components/AppComponents/Chat/Chat/chat";
import LessonPlanDisplay from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
import Layout from "@/components/AppComponents/Layout";
import {
  type Language,
  useTranslation,
} from "@/components/ContextProviders/LanguageContext";
import { useReactScan } from "@/hooks/useReactScan";
import LessonPlanTrackingProvider from "@/lib/analytics/lessonPlanTrackingContext";
import { AilaStoresProvider } from "@/stores/AilaStoresProvider";

const ChatPageContents = ({
  id,
  language,
}: {
  readonly id: string;
  readonly language: Language;
}) => {
  useReactScan({ component: LessonPlanDisplay, interval: 10000 });
  const { setLanguage } = useTranslation();
  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);
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
