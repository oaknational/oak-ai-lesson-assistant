import { useState } from "react";

import type { ParsedMessage } from "@/stores/chatStore/types";

import { ChatMessagePart } from "./ChatMessagePart";
import { Moderation } from "./ModerationMessage";
import { Message } from "./layout";

export interface ChatMessageProps {
  message: ParsedMessage;
}

function isActionMessage(message: ParsedMessage) {
  return message.parts.every((part) => part.document.type === "action");
}

function roleType(message: ParsedMessage) {
  if (message.hasError) {
    return "error";
  }
  return message.role === "user" ? "user" : "aila";
}

export function ChatMessage({ message }: Readonly<ChatMessageProps>) {
  const [inspect, setInspect] = useState(false);

  if (isActionMessage(message)) {
    return null;
  }

  return (
    <>
      <Moderation forMessage={message} />
      <Message.Container roleType={roleType(message)}>
        <button
          className="absolute left-0 top-0 h-20 w-20"
          onClick={() => {
            setInspect(!inspect);
          }}
        />
        <Message.Content>
          {message.parts.map((part) => {
            return (
              <div className="w-full" key={part.id}>
                <ChatMessagePart part={part} inspect={inspect} />
              </div>
            );
          })}
        </Message.Content>
      </Message.Container>
    </>
  );
}
