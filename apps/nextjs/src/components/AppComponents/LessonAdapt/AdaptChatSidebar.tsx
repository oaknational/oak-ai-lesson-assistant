"use client";

import { useRef, useState } from "react";

import {
  OakBox,
  OakFlex,
  OakLoadingSpinner,
  OakP,
  OakSmallPrimaryButton,
  OakTextInput,
} from "@oaknational/oak-components";

import { useLessonAdaptChat } from "@/stores/lessonAdaptStore/LessonAdaptStoreProvider";

export function AdaptChatSidebar() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isGenerating } = useLessonAdaptChat();

  const handleSend = () => {
    const textToSend = inputValue.trim();
    if (!textToSend) return;

    void sendMessage(textToSend);
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
          {isGenerating && <OakLoadingSpinner />}
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
        {messages.map((message) => (
          <OakBox
            key={message.id}
            $background={message.role === "user" ? "black" : "bg-neutral"}
            $pa="spacing-12"
            $borderRadius="border-radius-m"
            className={message.role === "assistant" ? "max-w-[320px]" : ""}
          >
            <OakP
              $font="body-3"
              $color={message.role === "user" ? "white" : "text-primary"}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {message.content}
            </OakP>
          </OakBox>
        ))}

        <div ref={messagesEndRef} />
      </OakFlex>

      {isGenerating && (
        <OakFlex $justifyContent="center" $pa="spacing-12">
          <OakLoadingSpinner />
        </OakFlex>
      )}

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
            disabled={isGenerating}
          />
          <OakSmallPrimaryButton onClick={handleSend} disabled={isGenerating}>
            Send
          </OakSmallPrimaryButton>
        </OakFlex>
      </OakBox>
    </OakFlex>
  );
}
