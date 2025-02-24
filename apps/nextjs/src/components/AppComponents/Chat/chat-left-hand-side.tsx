import { Flex } from "@radix-ui/themes";

import { useDemoLocking } from "@/hooks/useDemoLocking";

import ChatLhsHeader from "./chat-lhs-header";
import { ChatList } from "./chat-list";
import { ChatPanel } from "./chat-panel";
import { ChatPanelArea } from "./chat-panel-area";
import QuickActionButtons from "./chat-quick-buttons";

type ChatLeftHandSideProps = {
  showLessonMobile: boolean;
  setShowLessonMobile: (value: boolean) => void;
};

const ChatLeftHandSide = ({
  showLessonMobile,
  setShowLessonMobile,
}: Readonly<ChatLeftHandSideProps>) => {
  const isDemoLocked = useDemoLocking();

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
        showStreamingStatus={process.env.NEXT_PUBLIC_ENVIRONMENT !== "prd"}
      />
      <div>
        <ChatPanelArea isDemoLocked={isDemoLocked}>
          <ChatList
            isDemoLocked={isDemoLocked}
            showLessonMobile={showLessonMobile}
          />
        </ChatPanelArea>
        {!isDemoLocked && <QuickActionButtons />}
      </div>
      <ChatPanel isDemoLocked={isDemoLocked} />
      <span className="absolute right-0 top-[-70px] z-10 hidden h-[calc(100vh+100px)] w-3 bg-black sm:block" />
    </Flex>
  );
};

export default ChatLeftHandSide;
