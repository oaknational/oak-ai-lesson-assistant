"use client";

import * as React from "react";

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
import { SideBarChatItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { constructChatPath } from "./Chat/utils";

interface SidebarItemProps {
  chat: SideBarChatItem;
  children?: React.ReactNode;
}

export function SidebarItem({ chat, children }: SidebarItemProps) {
  const pathname = usePathname();

  const isActive = pathname.includes(chat.id);

  return (
    <motion.div
      className="relative h-18"
      variants={{
        initial: {
          height: 0,
          opacity: 0,
        },
        animate: {
          height: "auto",
          opacity: 1,
        },
      }}
      transition={{
        duration: 0.25,
        ease: "easeIn",
      }}
    >
      <div className="absolute left-7 top-5 mr-7 flex h-14 w-14 items-center justify-center">
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
      </div>
      <Link
        href={constructChatPath(chat)}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "group w-full px-18 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-300/10",
          isActive && "bg-zinc-200 pr-25 font-semibold dark:bg-zinc-800",
        )}
      >
        <div
          className="relative ml-7 flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          <span className="whitespace-nowrap">
            <span>{chat.title}</span>
          </span>
        </div>
      </Link>
      <div className="absolute right-7 top-5">{children}</div>
    </motion.div>
  );
}
