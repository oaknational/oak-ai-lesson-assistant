"use client";

import { useRef, useState } from "react";

import {
  OakBox,
  OakFlex,
  OakP,
  OakSmallPrimaryButton,
  OakTextInput,
} from "@oaknational/oak-components";

import { trpc } from "@/utils/trpc";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AdaptChatSidebarProps {
  sessionId: string;
}

const suggestions = [
  "Focus the lesson on another city",
  "Remove the last key learning point",
  "Lower the reading age",
  "Increase the reading age",
];

export function AdaptChatSidebar({ sessionId }: AdaptChatSidebarProps) {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mutation = trpc.lessonAdapt.generatePlan.useMutation();

  const handleSend = (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    mutation.mutateAsync({
      sessionId,
      userMessage: textToSend,
    });
    setInputValue("");

    // Simulate AI typing
    setIsTyping(true);
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
        {mutation.data && <>{JSON.stringify(mutation.data)}</>}
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
        {/* {messages.map((message) => (
          <OakBox
            key={message.id}
            $background={message.isUser ? "black" : "bg-neutral"}
            $pa="spacing-12"
            $borderRadius="border-radius-m"
            className={`${message.isUser ? "ml-auto max-w-[300px]" : "max-w-[277px]"}`}
          >
            <OakP
              $font="body-3"
              $color={message.isUser ? "white" : "text-primary"}
            >
              {message.text}
            </OakP>
          </OakBox>
        ))} */}
        {/* Typing indicator */}
        {isTyping && (
          <OakBox
            $background="bg-neutral"
            $pa="spacing-12"
            $borderRadius="border-radius-m"
            className="max-w-[277px]"
          >
            <OakFlex $gap="spacing-4" $alignItems="center">
              <div
                className="bg-grey-500 size-1.5 animate-bounce rounded-full"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="bg-grey-500 size-1.5 animate-bounce rounded-full"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="bg-grey-500 size-1.5 animate-bounce rounded-full"
                style={{ animationDelay: "300ms" }}
              />
            </OakFlex>
          </OakBox>
        )}
        <div ref={messagesEndRef} />
      </OakFlex>

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
