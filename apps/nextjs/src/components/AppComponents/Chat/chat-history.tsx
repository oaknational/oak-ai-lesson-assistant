"use client";

import * as React from "react";
import { useEffect } from "react";

import { OakIcon, OakModal, OakModalFooter } from "@oaknational/oak-components";
import { usePathname } from "next/navigation";

import { SidebarList } from "@/components/AppComponents/Chat/sidebar-list";

import { useDialog } from "../DialogContext";
import { ClearHistory } from "./clear-history";
import ChatButton from "./ui/chat-button";

export function ChatHistory() {
  const ailaId = usePathname().split("aila/")[1];
  const { openSidebar, setOpenSidebar } = useDialog();

  useEffect(() => {
    if (openSidebar) {
      const style = document.createElement("style");
      style.innerHTML = `
        .bb-feedback-button.gleap-font.gl-block {
          display: none !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [openSidebar]);
  return (
    <OakModal
      data-testid="sidebar"
      isLeftHandSide={false}
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
