"use client";

import { ClearHistory } from "@/components/AppComponents/Chat/clear-history";
import { SidebarItems } from "@/components/AppComponents/Chat/sidebar-items";
import { trpc } from "@/utils/trpc";

export function SidebarList() {
  const chatsRequest = trpc.chat.appSessions.getSidebarChats.useQuery();

  const chats = chatsRequest.data;

  //@todo refactor to oak components
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="mb-30 space-y-7 px-7">
          <p className="mb-14 border-t-2 border-black border-opacity-20 pl-10 pt-14 text-xl font-bold">
            Lesson history
          </p>
          {chats?.length ? <SidebarItems chats={chats} /> : null}
        </div>
      </div>
    </div>
  );
}
