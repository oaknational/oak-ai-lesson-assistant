import React from "react";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";

import { ChatLayout } from "../chat-layout";
import ChatModeration from "./ChatModeration";
import ChatUserAccessCheck from "./ChatUserAccessCheck";

export interface ChatProps extends React.ComponentProps<"div"> {
  className?: string;
  featureFlag?: boolean;
  isShared: boolean | undefined;
}

export function Chat({
  className,
  featureFlag,
  isShared,
}: Readonly<ChatProps>) {
  const chat = useLessonChat();
  const { id, lessonPlan, messages } = chat;

  return (
    <ChatUserAccessCheck userCanView={featureFlag ?? false}>
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
    </ChatUserAccessCheck>
  );
}
