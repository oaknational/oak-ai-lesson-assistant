import React from "react";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";

import { ChatLayout } from "../chat-layout";
import ChatModeration from "./ChatModeration";

export interface ChatProps extends React.ComponentProps<"div"> {
  className?: string;
  featureFlag?: boolean;
}

export function Chat({ className }: Readonly<ChatProps>) {
  const chatContext = useLessonChat();
  const { id, lessonPlan, messages, chat } = chatContext;
  const isShared = chat?.isShared ?? false;
  return (
    <ChatModeration>
      <DialogRoot>
        <DialogContents
          lesson={lessonPlan}
          chatId={id}
          messages={messages}
          isShared={isShared}
        />
        <ChatLayout className={className} />
      </DialogRoot>
    </ChatModeration>
  );
}
