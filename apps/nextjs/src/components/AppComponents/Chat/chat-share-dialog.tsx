"use client";

import * as React from "react";
import { toast } from "react-hot-toast";

import { aiLogger } from "@oakai/logger";
import type { DialogProps } from "@radix-ui/react-dialog";

import { Button } from "@/components/AppComponents/Chat/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/AppComponents/Chat/ui/dialog";
import { IconSpinner } from "@/components/AppComponents/Chat/ui/icons";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import type { SideBarChatItem } from "@/lib/types";
import { trpc } from "@/utils/trpc";

import { constructSharePath } from "./Chat/utils";

const log = aiLogger("chat");

interface ChatShareDialogProps extends DialogProps {
  chat: SideBarChatItem;
  onCopy: () => void;
}

export function ChatShareDialog({
  chat,
  onCopy,
  ...props
}: ChatShareDialogProps) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 });
  const [isSharePending, startShareTransition] = React.useTransition();

  const shareChatTrpc = trpc.chat.appSessions.shareChat.useMutation({
    onSuccess() {
      const sharePath = constructSharePath(chat);
      const url = new URL(window.location.href);
      url.pathname = sharePath;
      copyToClipboard(url.toString());
      toast.success("Share link copied to clipboard", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          fontSize: "14px",
        },
        iconTheme: {
          primary: "white",
          secondary: "black",
        },
      });
      onCopy();
      toast.success("Link copied to clipboard");
    },
    onError(error) {
      log.error(error); // TODO sentry?
      toast.error("Failed to share chat");
    },
  });

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link to chat</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view the shared chat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 rounded-md border p-10 text-sm">
          <div className="font-medium">{chat.title}</div>
        </div>
        <DialogFooter className="items-center">
          <Button
            disabled={isSharePending}
            onClick={() => {
              startShareTransition(() => {
                shareChatTrpc.mutate({ id: chat.id });
              });
            }}
          >
            {isSharePending ? (
              <>
                <IconSpinner className="mr-7 animate-spin" />
                Copying...
              </>
            ) : (
              <>Copy link</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
