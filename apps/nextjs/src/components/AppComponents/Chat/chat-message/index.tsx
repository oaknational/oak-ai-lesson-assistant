import { useState, type ReactNode } from "react";

import { isSafe } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { useChatModeration } from "@/components/ContextProviders/ChatModerationContext";
import { Icon } from "@/components/Icon";
import { useModerationStore } from "@/stores/AilaStoresProvider";
import type { ParsedMessage } from "@/stores/chatStore/types";

import { ChatMessagePart } from "./ChatMessagePart";
import { isModeration } from "./protocol";

export interface ChatMessageProps {
  message: ParsedMessage;
}

function getModeration(
  message: ParsedMessage,
  persistedModerations: PersistedModerationBase[],
) {
  const moderationMessagePart = message.parts.find(
    (m) => isModeration(m.document) && m.document?.id,
  )?.document as PersistedModerationBase | undefined;

  const messageId = message.id;

  const matchingPersistedModeration: PersistedModerationBase | undefined =
    persistedModerations.find((m) => m.messageId === messageId);

  const moderation = matchingPersistedModeration ?? moderationMessagePart;
  if (moderation && !isSafe(moderation)) {
    return moderation;
  }
  return null;
}

function Moderation({
  moderation,
}: Readonly<{ moderation: PersistedModerationBase }>) {
  const { moderationModalHelpers } = useChatModeration();
  return (
    <MessageWrapper
    // errorType="moderation" type={getAvatarType()}
    >
      <MessageTextWrapper>
        <div className="flex items-center">
          <Icon icon="warning" size="sm" className="mr-6" />
          <aside className="pt-3 text-sm">
            <a
              href="#"
              onClick={() => {
                moderationModalHelpers.openModal({
                  moderation: moderation,
                  closeModal: moderationModalHelpers.closeModal,
                });
              }}
              className="underline"
            >
              View content guidance
            </a>
          </aside>
        </div>
      </MessageTextWrapper>
    </MessageWrapper>
  );
}

function isActionMessage(message: ParsedMessage) {
  return message.parts.every((part) => part.document.type === "action");
}

export function ChatMessage({ message }: Readonly<ChatMessageProps>) {
  // const chatId = useLessonPlanStore((state) => state.id);
  const persistedModerations = useModerationStore((state) => state.moderations);

  const [inspect, setInspect] = useState(false);

  if (isActionMessage(message)) {
    return null;
  }

  const matchingModeration = getModeration(message, persistedModerations);

  return (
    <>
      {matchingModeration && <Moderation moderation={matchingModeration} />}

      <button
        className="absolute left-0 top-0 h-20 w-20"
        onClick={() => {
          setInspect(!inspect);
        }}
      />
      <MessageTextWrapper>
        {message.parts.map((part) => {
          return (
            <div className="w-full" key={part.id}>
              <ChatMessagePart part={part} inspect={inspect} />
            </div>
          );
        })}
      </MessageTextWrapper>
    </>
  );
}

type MessageWrapperProps = Readonly<{ children: ReactNode }>;

export function MessageWrapper({ children }: MessageWrapperProps) {
  return <>{children}</>;
}

export function MessageTextWrapper({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex w-full flex-col items-start justify-between">
      {children}
    </div>
  );
}
