import React from "react";

import { useRouter } from "next/navigation";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useChatStore } from "@/stores/AilaStoresProvider";

import AiIcon from "../../AiIcon";
import ChatButton from "./ui/chat-button";

type ChatLhsHeaderProps = {
  setShowLessonMobile: (value: boolean) => void;
  showLessonMobile: boolean;
  showStreamingStatus: boolean;
};

const ChatLhsHeader = ({
  setShowLessonMobile,
  showLessonMobile,
  showStreamingStatus,
}: Readonly<ChatLhsHeaderProps>) => {
  const router = useRouter();
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );
  const isDemoUser = useDemoUser().isDemoUser;

  return (
    <>
      <div className="mt-6 hidden items-center justify-end gap-5 sm:flex">
        {showStreamingStatus && (
          <div className="flex flex-grow flex-row space-x-4 text-left text-xs">
            <div data-testid="chat-aila-streaming-status">
              {ailaStreamingStatus}
            </div>
          </div>
        )}
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
      <div className={`${isDemoUser && "mt-16"} flex justify-end sm:hidden`}>
        <button
          onClick={() => setShowLessonMobile(!showLessonMobile)}
          className="flex items-center gap-5"
        >
          <AiIcon />{" "}
          <span className={"text-base font-bold"}>View lesson &gt;</span>
        </button>
      </div>
    </>
  );
};

export default ChatLhsHeader;
