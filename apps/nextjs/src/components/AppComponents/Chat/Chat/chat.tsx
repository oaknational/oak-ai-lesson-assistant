import React from "react";

import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";

import { ChatLayout } from "../chat-layout";
import ChatModeration from "./ChatModeration";

export interface ChatProps extends React.ComponentProps<"div"> {
  className?: string;
  featureFlag?: boolean;
}

export function Chat({ className }: Readonly<ChatProps>) {
  const lessonPlan = useLessonPlanStore((state) => state.lessonPlan);
  const id = useLessonPlanStore((state) => state.id);
  const isShared = useLessonPlanStore((state) => state.isShared);
  const messages = useChatStore((state) => state.stableMessages);

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
