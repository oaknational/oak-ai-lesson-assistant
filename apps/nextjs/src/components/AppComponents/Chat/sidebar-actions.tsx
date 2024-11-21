"use client";

import * as React from "react";
import { toast } from "react-hot-toast";

import { useRouter } from "next/navigation";

import { ChatShareDialog } from "@/components/AppComponents/Chat/chat-share-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/AppComponents/Chat/ui/alert-dialog";
import { Button } from "@/components/AppComponents/Chat/ui/button";
import {
  IconShare,
  IconSpinner,
  IconTrash,
} from "@/components/AppComponents/Chat/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/AppComponents/Chat/ui/tooltip";
import type { SideBarChatItem } from "@/lib/types";
import { trpc } from "@/utils/trpc";

type SidebarActionsProps = Readonly<{
  chat: SideBarChatItem;
}>;

export function SidebarActions({ chat }: SidebarActionsProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [isRemovePending, startRemoveTransition] = React.useTransition();

  const deleteChat =
    trpc.chat.appSessions.deleteChatById.useMutation().mutateAsync;

  return (
    <>
      <div className="space-x-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-14 w-14 p-0 hover:bg-background"
              onClick={() => setShareDialogOpen(true)}
            >
              <IconShare />
              <span className="sr-only">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share chat</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-14 w-14 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
      </div>
      <ChatShareDialog
        chat={chat}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onCopy={() => setShareDialogOpen(false)}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat message and remove your
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={(event) => {
                event.preventDefault();
                startRemoveTransition(async () => {
                  try {
                    await deleteChat({
                      id: chat.id,
                    });

                    setDeleteDialogOpen(false);
                    router.refresh();
                    router.push("/");
                    toast.success("Chat deleted");
                  } catch (err) {
                    toast.error("Failed to delete chat");
                  }
                });
              }}
            >
              {isRemovePending && <IconSpinner className="mr-7 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
