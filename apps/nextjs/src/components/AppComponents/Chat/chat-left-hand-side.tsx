import React from "react";

import { Flex } from "@radix-ui/themes";
import { Message } from "ai";

import { DemoContextProps } from "@/components/ContextProviders/Demo";

import ChatLhsHeader from "./chat-lhs-header";
import { ChatList } from "./chat-list";
import { ChatPanel } from "./chat-panel";
import { ChatPanelArea } from "./chat-panel-area";
import QuickActionButtons from "./chat-quick-buttons";

type ChatLeftHandSideProps = {
  chatAreaRef: React.RefObject<HTMLDivElement>;
  messages: Message[];
  isDemoLocked: boolean;
  showLessonMobile: boolean;
  setShowLessonMobile: (value: boolean) => void;
  demo: DemoContextProps;
  isDemoUser: boolean;
};

const ChatLeftHandSide = ({
  chatAreaRef,
  messages,
  isDemoLocked,
  showLessonMobile,
  setShowLessonMobile,
  demo,
  isDemoUser,
}: Readonly<ChatLeftHandSideProps>) => {
  return (
    <Flex
      direction="column"
      gap="4"
      className="w-full bg-[#ECEFF8] px-13 pt-28 sm:w-[50%] sm:px-24 lg:w-[600px] lg:min-w-[600px]"
      height="100%"
      position="relative"
    >
      <ChatLhsHeader
        setShowLessonMobile={setShowLessonMobile}
        showLessonMobile={showLessonMobile}
        isDemoUser={isDemoUser}
      />
      <div>
        <ChatPanelArea chatAreaRef={chatAreaRef} isDemoLocked={isDemoLocked}>
          <ChatList
            isDemoLocked={isDemoLocked}
            showLessonMobile={showLessonMobile}
            demo={demo}
          />
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
  );
};

export default ChatLeftHandSide;
