"use client";

import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { AnimatePresence } from "framer-motion";

import type { SideBarChatItem } from "@/lib/types";

import RenderChats from "./render-chat-history";

interface SidebarItemsProps {
  chats: SideBarChatItem[];
}

export function SidebarItems({ chats }: Readonly<SidebarItemsProps>) {
  if (!chats.length) return null;
  const filteredEmptyTitles = chats.filter((chat) => chat.title !== "");
  const parsedChats = filteredEmptyTitles
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
      acc[monthYear]?.push(chat);
    }
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {todayChats.length > 0 && RenderChats("Today", todayChats)}
      {lastWeekChats.length > 0 && RenderChats("Last week", lastWeekChats)}
      {lastMonthChats.length > 0 && RenderChats("Last 30 days", lastMonthChats)}
      {Object.entries(olderChatsByMonth).map(([monthYear, chats]) =>
        RenderChats(monthYear, chats),
      )}
    </AnimatePresence>
  );
}
