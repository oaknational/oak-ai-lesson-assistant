import React, { useCallback } from "react";

import { useRouter } from "next/navigation";

import {
  useChatLessonPlan,
  useChatStreaming,
} from "@/components/ContextProviders/ChatProvider";

import AiIcon from "../../AiIcon";
import ChatButton from "./ui/chat-button";

type ChatLhsHeaderProps = {
  setShowLessonMobile: (value: boolean) => void;
  showLessonMobile: boolean;
  isDemoUser: boolean;
};

const ChatLhsHeader = ({
  setShowLessonMobile,
  showLessonMobile,
  isDemoUser,
}: Readonly<ChatLhsHeaderProps>) => {
  const router = useRouter();
  const { iteration } = useChatLessonPlan();
  const { ailaStreamingStatus, streamingSection } = useChatStreaming();

  const handleNewLesson = useCallback(() => {
    router.push("/aila");
  }, [router]);

  const handleShowLessonMobile = useCallback(() => {
    setShowLessonMobile(!showLessonMobile);
  }, [setShowLessonMobile, showLessonMobile]);
  return (
    <>
      <div className="mt-6 hidden items-center justify-end gap-5 sm:flex">
        {process.env.NEXT_PUBLIC_ENVIRONMENT !== "production" && (
          <div className="flex flex-grow flex-row space-x-4 text-left text-xs">
            <div data-testid="chat-iteration">{iteration ?? 0}</div>
            <div data-testid="chat-aila-streaming-status">
              {ailaStreamingStatus}
            </div>
            <div data-testid="chat-aila-streaming-section">
              {streamingSection}
            </div>
          </div>
        )}
        <ChatButton variant="secondary" onClick={handleNewLesson} size="sm">
          New lesson
        </ChatButton>
      </div>
      <div className={`${isDemoUser && "mt-16"} flex justify-end sm:hidden`}>
        <button
          onClick={handleShowLessonMobile}
          className="flex items-center gap-5"
          data-testid="view-lesson-button"
        >
          <AiIcon />{" "}
          <span className={"text-base font-bold "}>View lesson &gt;</span>
        </button>
      </div>
    </>
  );
};

export default ChatLhsHeader;
