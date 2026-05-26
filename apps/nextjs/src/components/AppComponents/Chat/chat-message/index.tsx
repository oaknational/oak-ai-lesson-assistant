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

export function ChatMessage({ message }: Readonly<ChatMessageProps>) {
  const [inspect, setInspect] = useState(false);

  const normalParts = message.parts.filter(
    (part) => part.document.type !== "error",
  );
  const errorParts = message.parts.filter(
    (part) => part.document.type === "error",
  );

  if (isActionMessage(message)) {
    return null;
  }

  return (
    <>
      <Moderation forMessage={message} $mt="spacing-48" />
      {normalParts.length > 0 && (
        <Message.Container roleType={message.role === "user" ? "user" : "aila"}>
          <button
            className="absolute left-0 top-0 h-20 w-20"
            onClick={() => {
              setInspect(!inspect);
            }}
          />
          <Message.Content>
            {normalParts.map((part) => (
              <div className="w-full" key={part.id}>
                <ChatMessagePart part={part} inspect={inspect} />
              </div>
            ))}
          </Message.Content>
        </Message.Container>
      )}
      {errorParts.length > 0 && (
        <Message.Container roleType="error">
          <Message.Content>
            {errorParts.map((part) => (
              <div className="w-full" key={part.id}>
                <ChatMessagePart part={part} inspect={inspect} />
              </div>
            ))}
          </Message.Content>
        </Message.Container>
      )}
    </>
  );
}
