"use client";

import * as React from "react";

import { usePathname } from "#next/navigation";
import { OakIcon } from "@oaknational/oak-components";
import Link from "next/link";

import { SidebarList } from "@/components/AppComponents/Chat/sidebar-list";
import { buttonVariants } from "@/components/AppComponents/Chat/ui/button";
import { IconPlus } from "@/components/AppComponents/Chat/ui/icons";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { cn } from "@/lib/utils";

import ChatButton from "./ui/chat-button";

export function ChatHistory() {
  const { trackEvent } = useAnalytics();
  const path = usePathname();

  const idFromUrl = path.split("chat/")[1];
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
