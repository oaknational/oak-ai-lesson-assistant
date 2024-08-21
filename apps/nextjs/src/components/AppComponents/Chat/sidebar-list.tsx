"use client";

import { ClearHistory } from "@/components/AppComponents/Chat/clear-history";
import { SidebarItems } from "@/components/AppComponents/Chat/sidebar-items";
import { trpc } from "@/utils/trpc";

export async function SidebarList() {
  const chatsRequest = trpc.chat.appSessions.getSidebarChats.useQuery();

  const chats = chatsRequest.data;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {!chats?.length ? (
          <div className="p-18 text-center">
            <p className="text-sm text-muted-foreground">
              {chatsRequest.isLoading ? "Loading" : "No history"}
            </p>
          </div>
        ) : null}
        {chats?.length ? (
          <div className="space-y-7 px-7">
            <SidebarItems chats={chats} />
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-end p-10">
        <ClearHistory isEnabled={chats ? chats?.length > 0 : false} />
      </div>
    </div>
  );
}
