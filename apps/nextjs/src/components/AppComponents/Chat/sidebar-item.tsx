"use client";

import * as React from "react";

import { usePathname } from "#next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

import { buttonVariants } from "@/components/AppComponents/Chat/ui/button";
import {
  IconMessage,
  IconUsers,
} from "@/components/AppComponents/Chat/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { SideBarChatItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { constructChatPath } from "./Chat/utils";

interface SidebarItemProps {
  index: number;
  chat: SideBarChatItem;
  children: React.ReactNode;
}

export function SidebarItem({ index, chat, children }: SidebarItemProps) {
  const pathname = usePathname();

  const isActive = pathname.includes(chat.id);
  const [newChatId, setNewChatId] = useLocalStorage("newChatId", null);
  const shouldAnimate = index === 0 && isActive && newChatId;

  if (!chat?.id) return null;

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
      initial={shouldAnimate ? "initial" : undefined}
      animate={shouldAnimate ? "animate" : undefined}
      transition={{
        duration: 0.25,
        ease: "easeIn",
      }}
    >
      <div className="absolute left-7 top-5 flex h-14 w-14 items-center justify-center">
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
          <IconMessage className="mr-7" />
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
          className="relative flex-1 select-none overflow-hidden text-ellipsis break-all"
          title={chat.title}
        >
          <span className="whitespace-nowrap">
            {shouldAnimate ? (
              chat.title.split("").map((character, index) => (
                <motion.span
                  key={index}
                  variants={{
                    initial: {
                      opacity: 0,
                      x: -100,
                    },
                    animate: {
                      opacity: 1,
                      x: 0,
                    },
                  }}
                  initial={shouldAnimate ? "initial" : undefined}
                  animate={shouldAnimate ? "animate" : undefined}
                  transition={{
                    duration: 0.25,
                    ease: "easeIn",
                    delay: index * 0.05,
                    staggerChildren: 0.05,
                  }}
                  onAnimationComplete={() => {
                    if (index === chat.title.length - 1) {
                      setNewChatId(null);
                    }
                  }}
                >
                  {character}
                </motion.span>
              ))
            ) : (
              <span>{chat.title}</span>
            )}
          </span>
        </div>
      </Link>
      <div className="absolute right-7 top-5">{children}</div>
    </motion.div>
  );
}
