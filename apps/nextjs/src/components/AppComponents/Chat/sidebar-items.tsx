"use client";

import { OakBox, OakFlex, OakP } from "@oaknational/oak-components";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import { SidebarItem } from "@/components/AppComponents/Chat/sidebar-item";
import type { SideBarChatItem } from "@/lib/types";

interface SidebarItemsProps {
  chats: SideBarChatItem[];
}

export function SidebarItems({ chats }: Readonly<SidebarItemsProps>) {
  if (!chats.length) return null;

  const parsedChats = chats
    .map((chat) => ({
      ...chat,
      updatedAt: new Date(chat.updatedAt),
    }))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const todayChats = parsedChats.filter((chat) => isToday(chat.updatedAt));
  const lastWeekChats = parsedChats.filter(
    (chat) =>
      isThisWeek(chat.updatedAt, { weekStartsOn: 1 }) &&
      !isToday(chat.updatedAt),
  );
  const lastMonthChats = parsedChats.filter(
    (chat) =>
      isThisMonth(chat.updatedAt) &&
      !isThisWeek(chat.updatedAt, { weekStartsOn: 1 }),
  );

  const olderChatsByMonth = parsedChats.reduce<
    Record<string, SideBarChatItem[]>
  >((acc, chat) => {
    if (!isThisMonth(chat.updatedAt)) {
      const monthYear = format(chat.updatedAt, "MMMM yyyy");
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(chat);
    }
    return acc;
  }, {});

  const renderChats = (title: string, chats: SideBarChatItem[]) => (
    <OakBox $ml="space-between-s">
      <OakP $font="body-2-bold" $mb="space-between-s">
        {title}
      </OakP>
      <OakFlex
        $mb="space-between-s"
        $flexDirection="column"
        $gap="all-spacing-2"
      >
        {chats.map((chat) => (
          <motion.div key={chat.id} exit={{ opacity: 0, height: 0 }}>
            <SidebarItem chat={chat} />
          </motion.div>
        ))}
      </OakFlex>
    </OakBox>
  );

  return (
    <AnimatePresence>
      {todayChats.length > 0 && renderChats("Today", todayChats)}
      {lastWeekChats.length > 0 && renderChats("Last Week", lastWeekChats)}
      {lastMonthChats.length > 0 && renderChats("Last Month", lastMonthChats)}
      {Object.entries(olderChatsByMonth).map(([monthYear, chats]) =>
        renderChats(monthYear, chats),
      )}
    </AnimatePresence>
  );
}
