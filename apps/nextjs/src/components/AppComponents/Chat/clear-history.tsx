"use client";

import * as React from "react";
import { toast } from "react-hot-toast";

import { useRouter } from "#next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/AppComponents/Chat/ui/alert-dialog";
import { Button } from "@/components/AppComponents/Chat/ui/button";
import { IconSpinner } from "@/components/AppComponents/Chat/ui/icons";
import { trpc } from "@/utils/trpc";

type ClearHistoryProps = Readonly<{
  isEnabled: boolean;
}>;

export function ClearHistory({ isEnabled = false }: ClearHistoryProps) {
  const clearChats = trpc.chat.appSessions.deleteAllChats.useMutation({
    onSuccess() {
      toast.success("Chat history cleared");
      setOpen(false);
      router.push("/");
    },
    onError() {
      toast.error("Failed to clear chat history");
    },
  }).mutate;

  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" disabled={!isEnabled || isPending}>
          {isPending && <IconSpinner className="mr-7" />}
          Clear history
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your chat history and remove your data
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(() => {
                clearChats();
              });
            }}
          >
            {isPending && <IconSpinner className="mr-7 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
