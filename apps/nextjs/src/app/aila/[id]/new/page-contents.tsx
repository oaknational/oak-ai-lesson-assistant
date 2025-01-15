"use client";

import React, { useRef } from "react";

import { Message } from "ai";
import { useReactScan } from "hooks/useReactScan";
import { useChatStore } from "store/useChatStore";
import invariant from "tiny-invariant";

import LessonPlanDisplay from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
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

  return (
    <div className="bg-aqua">
      <ChatMessage message={currentMessage} />
      <LoadingWheel />
    </div>
  );
};

const ChatMessage = ({ message }: { readonly message: Message }) => {
  const renderCount = useRef(0);
  renderCount.current++;

  // TODO:
  // hasError
  // isEditing: has partial parts or no content parts
  // moderationMessagePart
  // hide if action part

  return (
    <div>
      Renders: {renderCount.current}
      <div>{message.role} - </div>
      <div>
        {message.parts.map((part) => (
          <div className="w-full" key={part.id}>
            <ChatMessagePart part={part} inspect={false} />
          </div>
        ))}
      </div>
      <div className="m-8 text-xs">
        {message.content.split("␞").map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
    </div>
  );
};

export default ChatPageContents;
