"use client";

import * as React from "react";
import { useState } from "react";

import { OakBox, OakFlex, OakSpan } from "@oaknational/oak-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AiIcon from "@/components/AiIcon";
import { buttonVariants } from "@/components/AppComponents/Chat/ui/button";
import { IconUsers } from "@/components/AppComponents/Chat/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import type { SideBarChatItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { constructChatPath } from "./Chat/utils";

interface SidebarItemProps {
  chat: SideBarChatItem;
  children?: React.ReactNode;
}

export function SidebarItem({ chat, children }: SidebarItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <OakFlex
      $justifyContent="flex"
      $gap="all-spacing-2"
      $background={isHovered ? `grey30` : `white`}
      $transition="standard-ease"
      $pa="inner-padding-ssx"
      $borderRadius="border-radius-s"
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
            <OakSpan $font="body-3">{chat.title}</OakSpan>
          </div>
        </OakFlex>
      </Link>
      <div className="absolute right-7 top-5">{children}</div>
    </OakFlex>
  );
}
