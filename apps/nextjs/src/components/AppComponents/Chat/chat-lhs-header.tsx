import React from "react";

import { useRouter } from "#next/navigation";

import AiIcon from "../../AiIcon";
import ChatButton from "./ui/chat-button";

type ChatLhsHeaderProps = {
  setShowLessonMobile: (value: boolean) => void;
  showLessonMobile: boolean;
};

const ChatLhsHeader = ({
  setShowLessonMobile,
  showLessonMobile,
}: Readonly<ChatLhsHeaderProps>) => {
  const router = useRouter();
  return (
    <>
      <div className="mt-6 hidden items-center justify-end gap-5 sm:flex">
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
          <span className="text-base font-bold">View lesson &gt;</span>
        </button>
      </div>
    </>
  );
};

export default ChatLhsHeader;
