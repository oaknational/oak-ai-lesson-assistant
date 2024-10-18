import React from "react";

import { useRouter } from "#next/navigation";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";

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
  const chat = useLessonChat();
  return (
    <>
      <div className="mt-6 hidden items-center justify-end gap-5 sm:flex">
        {process.env.NEXT_PUBLIC_ENVIRONMENT !== "production" && (
          <div
            className="flex-grow text-left text-xs"
            data-test="chat-aila-streaming-status"
          >
            {chat.ailaStreamingStatus}
            {chat.streamingSection && `: ${chat.streamingSection}`}
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
      <div className=" flex justify-end sm:hidden">
        <button
          onClick={() => setShowLessonMobile(!showLessonMobile)}
          className="flex items-center gap-5"
        >
          <AiIcon />{" "}
          <span className={`text-base font-bold ${isDemoUser && `mt-24`}`}>
            View lesson &gt;
          </span>
        </button>
      </div>
    </>
  );
};

export default ChatLhsHeader;
