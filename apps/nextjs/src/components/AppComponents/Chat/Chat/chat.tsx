import React from "react";

import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";

import { ChatLayout } from "../chat-layout";
import ChatModeration from "./ChatModeration";

export interface ChatProps extends React.ComponentProps<"div"> {
  className?: string;
  featureFlag?: boolean;
}

export function Chat({ className }: Readonly<ChatProps>) {
  return (
    <ChatModeration>
      <DialogRoot>
        <DialogContents />
        <ChatLayout className={className} />
      </DialogRoot>
    </ChatModeration>
  );
}
