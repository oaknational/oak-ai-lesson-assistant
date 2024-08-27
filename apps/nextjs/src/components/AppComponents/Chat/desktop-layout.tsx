import { useEffect, useRef, useState } from "react";

import { useRouter } from "#next/navigation";
import { Flex } from "@radix-ui/themes";
import { useDemoLocking } from "hooks/useDemoLocking";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import { cn } from "@/lib/utils";

import LessonPlanDisplay from "./chat-lessonPlanDisplay";
import { ChatList } from "./chat-list";
import { ChatPanel } from "./chat-panel";
import { ChatPanelArea } from "./chat-panel-area";
import QuickActionButtons from "./chat-quick-buttons";
import ExportButtons from "./export-buttons";
import ChatButton from "./ui/chat-button";

export interface DesktopChatLayoutProps {
  className?: string;
}

export const DesktopChatLayout = ({
  className,
}: Readonly<DesktopChatLayoutProps>) => {
  const chat = useLessonChat();

  const { messages, isLoading, chatAreaRef, lessonPlan } = chat;

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const sectionRefs = {};
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const demo = useDemoUser();
  const isDemoLocked = useDemoLocking(messages, isLoading);

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

  useEffect(() => {
    if (!hasStarted) {
      if (messages.length > 0) {
        setHasStarted(true);
      }
    }
  }, [messages, hasStarted, setHasStarted]);

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
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 top-0 z-30 hidden   md:block",
        className,
      )}
    >
      <div
        className={`flex h-full flex-row justify-start ${demo.isDemoUser ? "pt-22" : ""}`}
      >
        <Flex
          direction="column"
          gap="4"
          className="w-[50%] bg-[#ECEFF8] pl-24 pr-24 pt-28 lg:w-[600px] lg:min-w-[600px]"
          height="100%"
          position="relative"
        >
          <Flex align="center" gap="2" justify="between" mt="1">
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
          </Flex>
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
          <span className="absolute right-0 top-[-70px] z-10 h-[calc(100vh+100px)] w-3 bg-black" />
        </Flex>

        <div
          className="relative w-[50%] lg:w-full "
          ref={documentContainerRef}
          onScroll={handleScroll}
          style={{ overflowY: "auto" }}
        >
          <ExportButtons
            sectionRefs={sectionRefs}
            documentContainerRef={documentContainerRef}
          />
          <div className="w-full pt-20">
            <LessonPlanDisplay
              chatEndRef={chatEndRef}
              sectionRefs={sectionRefs}
              documentContainerRef={documentContainerRef}
            />
          </div>

          <span
            className={`sticky left-0 right-0 flex justify-center duration-500 ${showScrollButton ? "bottom-10 z-10 opacity-100" : "bottom-0 z-30 opacity-0"} `}
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
