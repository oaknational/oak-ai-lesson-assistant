import React, { useRef, useState } from "react";

import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";

import { useChatStore } from "@/stores/AilaStoresProvider";

import AiIcon from "../../AiIcon";
import type { DemoContextProps } from "../../ContextProviders/Demo";
import LessonPlanDisplay from "./chat-lessonPlanDisplay";
import ExportButtons from "./export-buttons";
import { LessonPlanProgressBar } from "./export-buttons/LessonPlanProgressBar";
import { MobileExportButtons } from "./export-buttons/MobileExportButtons";
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
  const hasMessages = useChatStore((state) => state.stableMessages.length > 0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const documentContainerRef = useRef<HTMLDivElement>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);

  // This retains this existing bug, but is fixed on subsequent PRs
  const sectionRefs: Partial<
    Record<LessonPlanKey, React.MutableRefObject<HTMLDivElement | null>>
  > = {};

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
      className={`fixed bottom-0 ${showLessonMobile ? "right-0" : "right-[-100%] sm:right-0"} right-0 ${demo.isDemoUser ? "top-8 sm:top-0" : "top-0"} z-30 w-[95%] bg-white shadow-md duration-300 sm:relative sm:z-0 sm:w-[50%] sm:shadow-none lg:w-full`}
      data-testid="chat-right-hand-side-lesson"
      ref={documentContainerRef}
      onScroll={handleScroll}
      style={{ overflowY: "auto" }}
    >
      <ExportButtons
        sectionRefs={sectionRefs}
        documentContainerRef={documentContainerRef}
      />
      <MobileExportButtons
        closeMobileLessonPullOut={closeMobileLessonPullOut}
      />

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
        className={`${hasMessages && showLessonMobile ? "flex" : "hidden"} fixed bottom-20 left-0 right-0 items-center justify-center duration-150 sm:hidden`}
      >
        <ChatButton
          variant="primary"
          testId="continue-building"
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
