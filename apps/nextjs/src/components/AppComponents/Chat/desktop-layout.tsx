import { useEffect, useRef, useState } from "react";

import { useRouter } from "#next/navigation";
import { OakIcon } from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";
import { useDemoLocking } from "hooks/useDemoLocking";
import { useMobileLessonPullOutControl } from "hooks/useMobileLessonPullOutControl";

import AiIcon from "@/components/AiIcon";
import Button from "@/components/Button";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import { cn } from "@/lib/utils";

import LessonPlanDisplay from "./chat-lessonPlanDisplay";
import { ChatList } from "./chat-list";
import { ChatPanel } from "./chat-panel";
import { ChatPanelArea } from "./chat-panel-area";
import QuickActionButtons from "./chat-quick-buttons";
import ExportButtons from "./export-buttons";
import { LessonPlanProgressBar } from "./export-buttons/LessonPlanProgressBar";
import { LessonPlanProgressDropdown } from "./export-buttons/LessonPlanProgressDropdown";
import ChatButton from "./ui/chat-button";

export interface DesktopChatLayoutProps {
  className?: string;
}

export const DesktopChatLayout = ({
  className,
}: Readonly<DesktopChatLayoutProps>) => {
  const chat = useLessonChat();

  const { messages, isLoading, chatAreaRef, lessonPlan, ailaStreamingStatus } =
    chat;

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const sectionRefs = {};
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const demo = useDemoUser();
  const isDemoLocked = useDemoLocking(messages, isLoading);

  const {
    showLessonMobile,
    setShowLessonMobile,
    setUserHasOverRiddenAutoPullOut,
  } = useMobileLessonPullOutControl({
    ailaStreamingStatus,
    messages,
  });

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      setShowScrollButton(false);
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      const isAtBottom =
        chatEndRef.current.getBoundingClientRect().bottom <= window.innerHeight;

      if (!isAtBottom) {
        setShowScrollButton(true);
      }
    }
  }, [setShowScrollButton, chatEndRef, lessonPlan]);

  const endOfDocRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (endOfDocRef.current) {
      const isAtBottom =
        endOfDocRef.current.getBoundingClientRect().bottom <=
        window.innerHeight;
      if (isAtBottom) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    }
  };

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 top-0 z-30 ", className)}>
      <div
        className={`flex h-full flex-row justify-start ${demo.isDemoUser ? "pt-22" : ""}`}
      >
        <Flex
          direction="column"
          gap="4"
          className="w-full bg-[#ECEFF8] px-13 pt-28 sm:w-[50%] sm:px-24 lg:w-[600px] lg:min-w-[600px]"
          height="100%"
          position="relative"
        >
          <div className="mt-6 hidden items-center justify-between gap-5 sm:flex">
            <p className="text-2xl font-bold">Aila</p>

            <ChatButton
              variant="secondary"
              onClick={() => {
                router.push("/aila");
              }}
              size="sm"
            >
              New lesson
            </ChatButton>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowLessonMobile(!showLessonMobile)}
              className="flex items-center gap-5"
            >
              <AiIcon />{" "}
              <span className="text-base font-bold">View lesson &gt;</span>
            </button>
          </div>
          <div>
            <ChatPanelArea
              chatAreaRef={chatAreaRef}
              isDemoLocked={isDemoLocked}
            >
              <ChatList isDemoLocked={isDemoLocked} />
            </ChatPanelArea>
            {!isDemoLocked && (
              <QuickActionButtons isEmptyScreen={!!messages.length} />
            )}
          </div>
          <ChatPanel
            isEmptyScreen={!!messages.length}
            isDemoLocked={isDemoLocked}
          />
          <span className="absolute right-0 top-[-70px] z-10 hidden h-[calc(100vh+100px)] w-3 bg-black sm:block" />
        </Flex>

        <div
          className={`fixed bottom-0 ${showLessonMobile ? `right-0` : `right-[-100%]`} right-0 top-0 z-30 w-[95%] bg-white duration-300 sm:relative  sm:z-0  sm:w-[50%] lg:w-full`}
          ref={documentContainerRef}
          onScroll={handleScroll}
          style={{ overflowY: "auto" }}
        >
          <div className="hidden sm:block">
            <ExportButtons
              sectionRefs={sectionRefs}
              documentContainerRef={documentContainerRef}
            />
          </div>
          <div className="ml-[-10px] mt-30 flex px-14 sm:hidden">
            <button
              onClick={() => {
                setShowLessonMobile(false);
                setUserHasOverRiddenAutoPullOut(true);
              }}
              className="flex items-center justify-center gap-3"
            >
              <span className="scale-75">
                <OakIcon iconName="cross" />
              </span>
              <span className="text-base font-bold">Hide lesson</span>
            </button>
          </div>
          <div className="px-14 pb-9 pt-12">
            <LessonPlanProgressBar lessonPlan={lessonPlan} />
          </div>

          <div className="w-full pt-9 sm:pt-20">
            <LessonPlanDisplay
              showLessonMobile={showLessonMobile}
              chatEndRef={chatEndRef}
              sectionRefs={sectionRefs}
              documentContainerRef={documentContainerRef}
            />
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
      </div>
    </div>
  );
};
