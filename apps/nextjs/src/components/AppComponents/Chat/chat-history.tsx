"use client";

import * as React from "react";

import { OakIcon, OakModal, OakModalFooter } from "@oaknational/oak-components";
import { usePathname } from "next/navigation";

import { SidebarList } from "@/components/AppComponents/Chat/sidebar-list";

import { ClearHistory } from "./clear-history";
import ChatButton from "./ui/chat-button";

export function ChatHistory({
  openSidebar,
  setOpenSidebar,
}: {
  openSidebar: boolean;
  setOpenSidebar: (value: boolean) => void;
}) {
  const ailaId = usePathname().split("aila/")[1];

  return (
    <OakModal
      data-testid="sidebar"
      zIndex={0}
      isOpen={openSidebar}
      onClose={() => setOpenSidebar(false)}
      footerSlot={
        <OakModalFooter>
          <ClearHistory isEnabled={true} />
        </OakModalFooter>
      }
    >
      <div className="flex h-full flex-col">
        <div className="my-10 flex flex-col px-7">
          <ChatButton href="/aila" variant="text-link" onClick={() => {}}>
            <span className="rotate-45">
              <OakIcon
                iconName="cross"
                $width="all-spacing-6"
                $height="all-spacing-6"
              />
            </span>
            <span>Create new lesson</span>
          </ChatButton>

          <ChatButton href="/" variant="text-link">
            <span className="scale-90">
              <OakIcon iconName="home" />
            </span>
            AI experiments page
          </ChatButton>
          <ChatButton
            href={ailaId ? `/aila/help/?ailaId=${ailaId}` : "/aila/help"}
            variant="text-link"
          >
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
    </OakModal>
  );
}
