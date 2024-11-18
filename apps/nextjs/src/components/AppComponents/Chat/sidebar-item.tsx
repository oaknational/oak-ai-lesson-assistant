"use client";

import * as React from "react";
import { useState } from "react";

import { OakFlex, OakSpan } from "@oaknational/oak-components";
import Link from "next/link";

import AiIcon from "@/components/AiIcon";
import { IconUsers } from "@/components/AppComponents/Chat/ui/icons";
import { SheetTrigger } from "@/components/AppComponents/Chat/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import BinIcon from "@/components/BinIcon";
import type { SideBarChatItem } from "@/lib/types";

import { useDialog } from "../DialogContext";
import { constructChatPath } from "./Chat/utils";
import { convertTitleCaseToSentenceCase } from "./chat-start-accordion";

interface SidebarItemProps {
  chat: SideBarChatItem;
  children?: React.ReactNode;
}

export function SidebarItem({ chat }: SidebarItemProps) {
  const { setDialogWindow } = useDialog();
  const [isHovered, setIsHovered] = useState(false);
  function deleteChatById() {
    localStorage.setItem("chatIdToDelete", chat.id);
    setDialogWindow("clear-single-chat");
  }
  return (
    <OakFlex
      $justifyContent="space-between"
      $alignItems="center"
      $background={isHovered ? `grey30` : `white`}
      $transition="standard-ease"
      $pa="inner-padding-ssx"
      $borderRadius="border-radius-s"
    >
      <OakFlex
        $justifyContent="flex-start"
        $gap="all-spacing-2"
        $alignItems="center"
      >
        {chat.isShared ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <IconUsers className="mr-7" />
            </TooltipTrigger>
            <TooltipContent>This is a shared chat.</TooltipContent>
          </Tooltip>
        ) : (
          <AiIcon />
        )}

        <Link
          href={constructChatPath(chat)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <OakFlex $justifyContent="flex-start">
            <div title={chat.title}>
              <OakSpan $font="body-3">
                {convertTitleCaseToSentenceCase(chat.title)}
              </OakSpan>
            </div>
          </OakFlex>
        </Link>
      </OakFlex>
      <button onClick={() => deleteChatById()} tabIndex={0}>
        <BinIcon />
      </button>
    </OakFlex>
  );
}
