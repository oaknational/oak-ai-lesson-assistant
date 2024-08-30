"use client";

import { AnimatePresence, motion } from "framer-motion";

import { SidebarItem } from "@/components/AppComponents/Chat/sidebar-item";
import { SideBarChatItem } from "@/lib/types";

interface SidebarItemsProps {
  chats: SideBarChatItem[];
}

export function SidebarItems({ chats }: Readonly<SidebarItemsProps>) {
  if (!chats.length) return null;

  return (
    <AnimatePresence>
      {chats.map((chat, index) => {
        return (
          <motion.div
            key={chat?.id}
            exit={{
              opacity: 0,
              height: 0,
            }}
          >
            <SidebarItem index={index} chat={chat} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
