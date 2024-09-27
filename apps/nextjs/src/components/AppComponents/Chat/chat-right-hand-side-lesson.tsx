import React, { useRef, useState } from "react";

import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { OakIcon, OakSmallSecondaryButton } from "@oaknational/oak-components";
import { Message } from "ai";
import Link from "next/link";

import AiIcon from "../../AiIcon";
import { DemoContextProps } from "../../ContextProviders/Demo";
import { useDialog } from "../DialogContext";
import LessonPlanDisplay from "./chat-lessonPlanDisplay";
import ExportButtons from "./export-buttons";
import { LessonPlanProgressBar } from "./export-buttons/LessonPlanProgressBar";
import ChatButton from "./ui/chat-button";

type ChatRightHandSideLessonProps = {
  id: string;
  messages: Message[];
  lessonPlan: LooseLessonPlan;
  showLessonMobile: boolean;
  closeMobileLessonPullOut: () => void;
  demo: DemoContextProps;
};

const ChatRightHandSideLesson = ({
  id,
  messages,
  showLessonMobile,
  closeMobileLessonPullOut,
  demo,
}: Readonly<ChatRightHandSideLessonProps>) => {
  const { setDialogWindow } = useDialog();

  const chatEndRef = useRef<HTMLDivElement>(null);

  const documentContainerRef = useRef<HTMLDivElement>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const sectionRefs = {};
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      setShowScrollButton(false);
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
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
  };

  const endOfDocRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className={`fixed bottom-0 ${showLessonMobile ? `right-0` : `right-[-100%] sm:right-0`} right-0 ${demo.isDemoUser ? `top-19 sm:top-0` : `top-0`} z-30 w-[95%] bg-white shadow-md duration-300 sm:relative sm:z-0  sm:w-[50%] sm:shadow-none lg:w-full`}
      ref={documentContainerRef}
      onScroll={handleScroll}
      style={{ overflowY: "auto" }}
    >
      <ExportButtons
        sectionRefs={sectionRefs}
        documentContainerRef={documentContainerRef}
      />

      <div className="ml-[-10px] mt-27 flex justify-between px-14 pt-6 sm:hidden">
        <button
          onClick={() => {
            closeMobileLessonPullOut();
          }}
          className="flex items-center justify-center gap-3"
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
          onClick={() => {
            if (!demo.isSharingEnabled) {
              setDialogWindow("demo-share-locked");
            }
          }}
        >
          Download
        </OakSmallSecondaryButton>
        <OakSmallSecondaryButton
          iconName="share"
          onClick={() => {
            if (demo.isSharingEnabled) {
              setDialogWindow("share-chat");
            } else {
              setDialogWindow("demo-share-locked");
            }
          }}
        >
          Share
        </OakSmallSecondaryButton>
      </div>
      <button
        className="sticky top-32 z-10 block w-full bg-white px-14 pb-9 pt-12 sm:hidden"
        onClick={() => {
          documentContainerRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      >
        <LessonPlanProgressBar />
      </button>

      <div className="w-full pt-9 sm:pt-20">
        <LessonPlanDisplay
          showLessonMobile={showLessonMobile}
          chatEndRef={chatEndRef}
          sectionRefs={sectionRefs}
          documentContainerRef={documentContainerRef}
        />
      </div>
      <div
        className={`${messages.length > 1 && showLessonMobile ? "flex" : "hidden"}  fixed bottom-20 left-0 right-0 items-center justify-center duration-150  sm:hidden`}
      >
        <ChatButton
          variant="primary"
          onClick={() => {
            closeMobileLessonPullOut();
          }}
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
          onClick={() => {
            scrollToBottom();
          }}
        >
          View more
        </ChatButton>
      </span>
      <div ref={endOfDocRef} />
    </div>
  );
};

export default ChatRightHandSideLesson;
