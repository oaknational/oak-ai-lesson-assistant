import React, { useCallback, useRef, useState } from "react";

import { OakIcon, OakSmallSecondaryButton } from "@oaknational/oak-components";
import Link from "next/link";

import { useChatStreaming } from "@/components/ContextProviders/ChatProvider";
import { WithProfiler } from "@/components/Profiler/WithProfiler";

import AiIcon from "../../AiIcon";
import type { DemoContextProps } from "../../ContextProviders/Demo";
import { useDialog } from "../DialogContext";
import LessonPlanDisplay from "./chat-lessonPlanDisplay";
import ExportButtons from "./export-buttons";
import { LessonPlanProgressBar } from "./export-buttons/LessonPlanProgressBar";
import ChatButton from "./ui/chat-button";

type ChatRightHandSideLessonProps = {
  showLessonMobile: boolean;
  closeMobileLessonPullOut: () => void;
  demo: DemoContextProps;
};

const ChatRightHandSideLesson = ({
  showLessonMobile,
  closeMobileLessonPullOut,
  demo,
}: Readonly<ChatRightHandSideLessonProps>) => {
  const { id, messageCount } = useChatStreaming();
  const { setDialogWindow } = useDialog();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const endOfDocRef = useRef<HTMLDivElement>(null);
  const documentContainerRef = useRef<HTMLDivElement>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      setShowScrollButton(false);
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [setShowScrollButton, chatEndRef]);

  const handleScroll = useCallback(() => {
    if (endOfDocRef.current) {
      const distanceFromBottom = 300;
      const isNearBottom =
        endOfDocRef.current.getBoundingClientRect().bottom <=
        window.innerHeight + distanceFromBottom;
      if (isNearBottom) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    }
  }, [endOfDocRef, setShowScrollButton]);

  const scrollToTop = useCallback(() => {
    () => {
      documentContainerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };
  }, [documentContainerRef]);

  const handleClose = useCallback(() => {
    closeMobileLessonPullOut();
  }, [closeMobileLessonPullOut]);

  const handleDownload = useCallback(() => {
    if (!demo.isSharingEnabled) {
      setDialogWindow("demo-share-locked");
    }
  }, [setDialogWindow, demo]);

  const handleShare = useCallback(() => {
    if (demo.isSharingEnabled) {
      setDialogWindow("share-chat");
    } else {
      setDialogWindow("demo-share-locked");
    }
  }, [setDialogWindow, demo]);

  return (
    <div
      className={`fixed bottom-0 ${showLessonMobile ? "right-0" : "right-[-100%] sm:right-0"} right-0 ${demo.isDemoUser ? "top-8 sm:top-0" : "top-0"} z-30 w-[95%] bg-white shadow-md duration-300 sm:relative sm:z-0  sm:w-[50%] sm:shadow-none lg:w-full`}
      data-testid="chat-right-hand-side-lesson"
      ref={documentContainerRef}
      onScroll={handleScroll}
      style={{ overflowY: "auto" }}
    >
      <ExportButtons documentContainerRef={documentContainerRef} />

      <div className="ml-[-10px] mt-27 flex justify-between px-14 pt-6 sm:hidden">
        <button
          onClick={handleClose}
          className={`${demo.isDemoUser ? "mt-25" : ""} flex items-center justify-center gap-3 `}
        >
          <span className="scale-75">
            <OakIcon iconName="cross" />
          </span>
          <span className="text-base font-bold">Hide lesson</span>
        </button>
      </div>
      <div className="sticky top-25 z-10 flex gap-10 bg-white p-12 sm:hidden">
        <OakSmallSecondaryButton
          element={Link}
          iconName="download"
          href={demo.isSharingEnabled ? `/aila/download/${id}` : "#"}
          onClick={handleDownload}
        >
          Download
        </OakSmallSecondaryButton>
        <OakSmallSecondaryButton iconName="share" onClick={handleShare}>
          Share
        </OakSmallSecondaryButton>
      </div>
      <button
        className="sticky top-32 z-10 block w-full bg-white px-14 pb-9 pt-12 sm:hidden"
        onClick={scrollToTop}
      >
        <LessonPlanProgressBar />
      </button>

      <div className="w-full pt-9 sm:pt-20">
        <WithProfiler id="chat-lessonPlanDisplay">
          <LessonPlanDisplay
            showLessonMobile={showLessonMobile}
            chatEndRef={chatEndRef}
          />
        </WithProfiler>
      </div>
      <div
        className={`${messageCount > 1 && showLessonMobile ? "flex" : "hidden"}  fixed bottom-20 left-0 right-0 items-center justify-center duration-150  sm:hidden`}
      >
        <ChatButton
          variant="primary"
          testId="continue-building"
          onClick={handleClose}
        >
          <AiIcon color="white" />
          Continue building
        </ChatButton>
      </div>
      <span
        className={`sticky left-0 right-0 hidden justify-center duration-500 sm:flex ${showScrollButton ? "bottom-10 z-10 opacity-100" : "bottom-0 z-30 opacity-0"} `}
      >
        <ChatButton
          variant="primary"
          icon="arrow-down"
          onClick={scrollToBottom}
        >
          View more
        </ChatButton>
      </span>
      <div ref={endOfDocRef} />
      <div className="h-[50vh]"></div>
    </div>
  );
};

export default ChatRightHandSideLesson;
