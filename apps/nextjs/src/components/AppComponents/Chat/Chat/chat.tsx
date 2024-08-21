import React from "react";

import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";

import { DesktopChatLayout } from "../desktop-layout";
import { MobileSupportBlocker } from "../mobile-support-blocker";
import ChatModeration from "./ChatModeration";
import ChatUserAccessCheck from "./ChatUserAccessCheck";

export interface ChatProps extends React.ComponentProps<"div"> {
  className?: string;
  featureFlag?: boolean;
}

export function Chat({ className, featureFlag }: Readonly<ChatProps>) {
  return (
    <ChatUserAccessCheck userCanView={featureFlag ?? false}>
      <ChatModeration>
        <DialogRoot>
          <DialogContents />
          <DesktopChatLayout className={className} />
          <MobileSupportBlocker />
        </DialogRoot>
      </ChatModeration>
    </ChatUserAccessCheck>
  );
}
