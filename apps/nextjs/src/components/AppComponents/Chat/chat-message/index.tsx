import { useState, type ReactNode } from "react";

import { isSafe } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { useChatModeration } from "@/components/ContextProviders/ChatModerationContext";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
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
    <MessageWrapper roleType="moderation">
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

function roleType(message: ParsedMessage) {
  if (message.hasError) {
    return "error";
  }
  return message.role === "user" ? "user" : "aila";
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
      <MessageWrapper roleType={roleType(message)}>
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
      </MessageWrapper>
    </>
  );
}

type MessageWrapperProps = Readonly<{
  children: ReactNode;
  roleType: "user" | "aila" | "moderation" | "error";
  className?: string;
}>;

const roleClassNames = {
  user: "bg-teachersLilac p-9",
  aila: "",
  moderation: "bg-videoBlue p-9",
  error: "bg-peachCream p-9",
};

export function MessageWrapper({
  children,
  roleType,
  className,
}: MessageWrapperProps) {
  const testId = `chat-message-wrapper-${roleType}`;
  return (
    <div
      className={cn(
        "relative mt-14 w-full items-start rounded-md",
        roleClassNames[roleType],
        className,
      )}
      data-testid={testId}
    >
      {roleType === "aila" && (
        <span className="block font-bold sm:hidden">Aila: </span>
      )}
      {children}
    </div>
  );
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
