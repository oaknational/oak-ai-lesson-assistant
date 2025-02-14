"use client";

import {
  MessageTextWrapper,
  MessageWrapper,
} from "@/components/AppComponents/Chat/chat-message";

import { Separator } from ".";
import { MemoizedReactMarkdownWithStyles } from "../markdown";

const text =
  "**Your lesson is complete**\n\nYou can no longer edit this lesson. [Create new lesson.](/aila)";

export function DemoLimitMessage() {
  return (
    <div className="w-full flex-col gap-11">
      <Separator />

      <MessageWrapper roleType="error">
        <MessageTextWrapper>
          <MemoizedReactMarkdownWithStyles markdown={text} />
        </MessageTextWrapper>
      </MessageWrapper>
    </div>
  );
}
