"use client";

import { Message } from "@/components/AppComponents/Chat/chat-message/layout";

import { MemoizedReactMarkdownWithStyles } from "../markdown";

const text =
  "**Your lesson is complete**\n\nYou can no longer edit this lesson. [Create new lesson.](/aila)";

export function DemoLimitMessage() {
  return (
    <Message.Spacing>
      <Message.Container roleType="error">
        <Message.Content>
          <MemoizedReactMarkdownWithStyles markdown={text} />
        </Message.Content>
      </Message.Container>
    </Message.Spacing>
  );
}
