"use client";

import * as React from "react";

import { OakIcon } from "@oaknational/oak-components";

import { SidebarList } from "@/components/AppComponents/Chat/sidebar-list";

import ChatButton from "./ui/chat-button";

export function ChatHistory() {
  return (
    <div className="mt-16 flex h-full flex-col">
      <div className="my-10 flex flex-col px-7">
        <ChatButton href="/aila" variant="text-link">
          <span className="rotate-45">
            <OakIcon
              iconName="cross"
              $width="all-spacing-6"
              $height="all-spacing-6"
            />
          </span>
          <span>New lesson</span>
        </ChatButton>
        <ChatButton href="/" variant="text-link">
          <OakIcon
            iconName="home"
            $width="all-spacing-6"
            $height="all-spacing-6"
          />
          AI Experiments
        </ChatButton>
        <ChatButton href="/aila/help" variant="text-link">
          <OakIcon
            iconName="question-mark"
            $width="all-spacing-6"
            $height="all-spacing-6"
          />
          Help
        </ChatButton>
      </div>
      <React.Suspense>
        <SidebarList />
      </React.Suspense>
    </div>
  );
}
