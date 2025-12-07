"use client";

import * as React from "react";
import { useEffect } from "react";

import {
  OakBox,
  OakIcon,
  OakInformativeModal,
  OakInformativeModalFooter,
  OakLink,
} from "@oaknational/oak-components";
import { usePathname } from "next/navigation";

import { SidebarList } from "@/components/AppComponents/Chat/sidebar-list";
import OakIconLogo from "@/components/OakIconLogo";
import { getAilaUrl } from "@/utils/getAilaUrl";

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
    <OakInformativeModal
      data-testid="sidebar"
      isLeftHandSide={false}
      zIndex={0}
      isOpen={openSidebar}
      onClose={() => setOpenSidebar(false)}
      footerSlot={
        <OakInformativeModalFooter>
          <ClearHistory isEnabled={true} />
        </OakInformativeModalFooter>
      }
    >
      {/*NOTE: Oak icon added after replacing OakModal with OakInformativeModal to match previous design*/}
      <OakBox
        $position="absolute"
        $top="spacing-16"
        $left="spacing-16"
        $borderRadius="border-radius-circle"
      >
        <OakLink element="button" onClick={() => setOpenSidebar(false)}>
          <OakIconLogo width={32} height={40} />
        </OakLink>
      </OakBox>
      {/*NOTE: mt-10 added to match previous design after replacing OakModal with OakInformativeModal*/}
      <div className="mt-10 flex h-full flex-col">
        <div className="my-10 flex flex-col px-7">
          <ChatButton
            href={getAilaUrl("start")}
            variant="text-link"
            onClick={() => setOpenSidebar(false)}
          >
            <span className="rotate-45">
              <OakIcon
                iconName="cross"
                $width="spacing-24"
                $height="spacing-24"
              />
            </span>
            <span>Create with AI</span>
          </ChatButton>

          <ChatButton href="/" variant="text-link">
            <span className="scale-90">
              <OakIcon iconName="home" />
            </span>{" "}
            AI experiments page
          </ChatButton>
          <ChatButton
            href={ailaId ? `/aila/help/?ailaId=${ailaId}` : "/aila/help"}
            variant="text-link"
          >
            <span className="scale-90">
              <OakIcon iconName="question-mark" />
            </span>{" "}
            Help
          </ChatButton>
        </div>
        <React.Suspense>
          <SidebarList />
        </React.Suspense>
      </div>
    </OakInformativeModal>
  );
}
