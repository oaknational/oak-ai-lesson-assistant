"use client";

/* eslint-disable no-console */
import { useRef, useState } from "react";

import {
  OakBox,
  OakFlex,
  OakLoadingSpinner,
  OakP,
  OakSmallPrimaryButton,
  OakTextInput,
} from "@oaknational/oak-components";

import { trpc } from "@/utils/trpc";

import { AdaptationPlanView } from "./AdaptationPlanView";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AdaptChatSidebarProps {
  sessionId: string;
}

export function AdaptChatSidebar({ sessionId }: AdaptChatSidebarProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mutation = trpc.lessonAdapt.generatePlan.useMutation();
  console.log("state", mutation.status, mutation.data, mutation.error);

  const handleSend = (messageText?: string) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional: empty string should fall through to inputValue
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;
    setMessages([
      ...messages,
      {
        id: `${Date.now()}`,
        text: inputValue,
        isUser: true,
        timestamp: new Date(),
      },
    ]);

    void mutation.mutateAsync({
      sessionId,
      userMessage: textToSend,
    });
    setInputValue("");
  };

  return (
    <OakFlex
      $flexDirection="column"
      $height="100%"
      className="border-grey-400 w-[424px] border-r bg-white"
    >
      {/* Header */}
      <OakBox
        $ba="border-solid-s"
        $pa="spacing-24"
        className="border-grey-400 border-b"
      >
        <OakFlex $alignItems="center" $gap="spacing-12">
          <OakP $font="heading-6">Aila</OakP>
          <OakBox
            $background="bg-neutral"
            $pa="spacing-4"
            $borderRadius="border-radius-s"
          >
            <OakP $font="body-4">Beta</OakP>
          </OakBox>
          {mutation.status === "pending" && <OakLoadingSpinner />}
        </OakFlex>
      </OakBox>

      {/* Messages */}
      <OakFlex
        $flexDirection="column"
        $gap="spacing-16"
        $flexGrow={1}
        $overflowY="auto"
        $pa="spacing-24"
      >
        {/* Initial message */}
        <OakBox
          $background="bg-neutral"
          $pa="spacing-16"
          $borderRadius="border-radius-m"
          className="max-w-[277px]"
        >
          <OakP $font="body-3">
            Hello! I'm Aila, your AI lesson assistant. How do you want to adapt
            this lesson?
          </OakP>
        </OakBox>
        {messages.map((message) => (
          <OakBox
            key={message.id}
            $background={message.isUser ? "bg-inverted" : "bg-neutral"}
            $pa="spacing-12"
            $borderRadius="border-radius-m"
          >
            <OakP
              $font="body-3"
              $color={message.isUser ? "text-inverted" : "text-primary"}
            >
              {message.text}
            </OakP>
          </OakBox>
        ))}

        {mutation.data && <AdaptationPlanView plan={mutation.data.plan} />}
        {/* {messages && messages.length === 0 && (
          <OakFlex $flexDirection="column" $gap="spacing-16">
            <OakP $font="heading-7">Try asking:</OakP>

            {suggestions.map((suggestion, index) => (
              <OakSecondaryButton
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </OakSecondaryButton>
            ))}
          </OakFlex>
        )} */}
        {/* Message history */}

        <div ref={messagesEndRef} />
      </OakFlex>
      {mutation.status === "pending" && <OakLoadingSpinner />}

      {/* Input area */}
      <OakBox
        $ba="border-solid-s"
        $pa="spacing-24"
        className="border-grey-400 border-t"
      >
        <OakP $font="heading-7" $mb="spacing-8">
          Type a response:
        </OakP>

        <OakFlex $gap="spacing-8" $alignItems="center" $mb="spacing-8">
          <OakTextInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder=""
          />
          <OakSmallPrimaryButton onClick={() => handleSend()}>
            Send
          </OakSmallPrimaryButton>
        </OakFlex>
      </OakBox>
    </OakFlex>
  );
}
