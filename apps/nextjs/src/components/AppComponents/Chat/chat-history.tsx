"use client";

import * as React from "react";

import { OakIcon } from "@oaknational/oak-components";

import { SidebarList } from "@/components/AppComponents/Chat/sidebar-list";

import ChatButton from "./ui/chat-button";

export function ChatHistory() {
  return (
    <div className="mt-20 flex h-full flex-col">
      <div className="my-10 flex flex-col px-7">
        <ChatButton href="/aila" variant="text-link">
          <span className="rotate-45 scale-90">
            <OakIcon iconName="cross" />
          </span>
          <span>New Lesson</span>
        </ChatButton>
        <ChatButton href="/aila" variant="text-link">
          <span className="scale-90">
            <OakIcon iconName="home" />
          </span>
          Ai experiments page
        </ChatButton>
        <ChatButton href="/aila" variant="text-link">
          <span className="scale-90">
            <OakIcon iconName="question-mark" />
          </span>
          Help
        </ChatButton>
      </div>
      <React.Suspense>
        <SidebarList />
      </React.Suspense>
    </div>
  );
}
