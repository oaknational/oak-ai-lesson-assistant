"use client";

import React, { useRef, useState } from "react";

import { Message } from "ai";
import { useReactScan } from "hooks/useReactScan";
import { MessageWithParts, useChatStore } from "store/useChatStore";
import invariant from "tiny-invariant";

import LessonPlanDisplay from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
import {
  MessageTextWrapper,
  MessageWrapper,
} from "@/components/AppComponents/Chat/chat-message";
import { ChatMessagePart } from "@/components/AppComponents/Chat/chat-message/ChatMessagePart";
import Layout from "@/components/AppComponents/Layout";
import LoadingWheel from "@/components/LoadingWheel";

import { AiSdk, useAiSdkActions } from "./AiSdk";

const ChatPageContents = ({ id }: { readonly id: string }) => {
  // useReactScan({ component: LessonPlanDisplay, interval: 10000 });

  return (
    <Layout>
      <AiSdk id={id}>
        <div className="flex gap-14">
          <LeftHandSide />
          <RightHandSide />
        </div>
      </AiSdk>
    </Layout>
  );
};

const LeftHandSide = () => {
  const isLoading = useChatStore((state) => state.isLoading);
  const { append } = useAiSdkActions();

  const renderCount = useRef(0);
  renderCount.current++;

  // Simple listing of messages and their content
  return (
    <div className="flex w-1/2 flex-col gap-14">
      {renderCount.current}
      <StableMessages />
      {isLoading && <CurrentMessage />}
      {isLoading && <LoadingWheel />}
      <button
        className="m-10 w-40 bg-mint p-5"
        // TODO: set isLoading at this point
        onClick={() =>
          (async () => {
            console.log("append start");
            await append({ role: "user", content: "Hello!" });
            console.log("append finish");
          })()
        }
        // disabled={isLoading}
      >
        Send message
      </button>
    </div>
  );
};

const RightHandSide = () => {
  return <div className="flex w-1/2 flex-col gap-14">TODO: lesson plan</div>;
};

const StableMessages = () => {
  const stableMessages = useChatStore((state) => state.stableMessages);
  if (!stableMessages.length) return null;

  return (
    <div className="flex flex-col gap-14">
      {stableMessages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
};

const CurrentMessage = () => {
  const currentMessage = useChatStore((state) => state.currentMessage);
  invariant(currentMessage, "currentMessage is required");

  return <ChatMessage message={currentMessage} />;
};

const ChatMessage = ({ message }: { readonly message: MessageWithParts }) => {
  const renderCount = useRef(0);
  renderCount.current++;

  // TODO:
  // moderationMessagePart
  // hide if action part

  const [showInspect, setShowInspect] = useState(true);

  return (
    <>
      <MessageWrapper
        // TODO: is this needed?
        type={getMessageType(message)}
        errorType={message.hasError ? "generic" : null}
      >
        <MessageTextWrapper>
          {message.parts.map((part) => (
            <div className="w-full" key={part.id}>
              <ChatMessagePart part={part} inspect={false} />
            </div>
          ))}
        </MessageTextWrapper>
      </MessageWrapper>

      <button
        className="absolute left-0 top-0 h-20 w-20"
        onClick={() => {
          setShowInspect(!showInspect);
        }}
      />
      {showInspect && (
        <div className="m-8 text-xs">
          Renders: {renderCount.current}
          {message.content.split("␞").map((m, i) => (
            <div key={i}>{m}</div>
          ))}
        </div>
      )}
    </>
  );
};

function getMessageType(message: MessageWithParts) {
  if (message.role === "user") {
    return "user";
  }
  if (message.hasError) {
    return "warning";
  }
  if (message.isEditing) {
    return "editing";
  }
  return "aila";
}

export default ChatPageContents;
