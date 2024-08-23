import React from "react";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";

import { DesktopChatLayout } from "../desktop-layout";
import { MobileSupportBlocker } from "../mobile-support-blocker";
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
          <DesktopChatLayout className={className} />
          <MobileSupportBlocker />
        </DialogRoot>
      </ChatModeration>
    </ChatUserAccessCheck>
  );
}
