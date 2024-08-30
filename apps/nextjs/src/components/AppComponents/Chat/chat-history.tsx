"use client";

import * as React from "react";

import { SidebarList } from "@/components/AppComponents/Chat/sidebar-list";

import ChatButton from "./ui/chat-button";

export function ChatHistory() {
  return (
    <div className="flex h-full flex-col">
      <div className="my-10 px-7">
        <ChatButton href="/aila" variant="primary">
          New Lesson
        </ChatButton>
      </div>
      <React.Suspense>
        <SidebarList />
      </React.Suspense>
    </div>
  );
}
