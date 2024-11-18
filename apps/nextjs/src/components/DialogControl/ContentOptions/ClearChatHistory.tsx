"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";

import {
  OakFlex,
  OakP,
  OakSmallPrimaryButton,
  OakSmallSecondaryButton,
} from "@oaknational/oak-components";
import { useRouter } from "next/navigation";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

const ClearChatHistory = ({ closeDialog }: { closeDialog: () => void }) => {
  const router = useRouter();
  const clearChats = trpc.chat.appSessions.deleteAllChats.useMutation({
    onSuccess() {
      toast.success("Chat history cleared");
      closeDialog();
      router.push("/aila");
    },
    onError() {
      toast.error("Failed to clear chat history");
    },
  }).mutate;

  const [isPending, startTransition] = useTransition();

  return (
    <OakFlex
      $flexDirection="column"
      $justifyContent="center"
      $gap="space-between-m"
    >
      <OakP $font="body-1-bold">Are you absolutely sure?</OakP>
      <OakP>
        This will permanently delete your chat history and remove your data from
        our servers.
      </OakP>
      <OakFlex $gap="all-spacing-2" $justifyContent="flex-end">
        <OakSmallSecondaryButton
          disabled={isPending}
          onClick={() => closeDialog()}
        >
          Cancel
        </OakSmallSecondaryButton>
        <OakSmallPrimaryButton
          disabled={isPending}
          onClick={(event) => {
            event.preventDefault();
            startTransition(() => {
              clearChats();
            });
          }}
        >
          {isPending && (
            <OakFlex $justifyContent="center" $alignItems="center">
              <LoadingWheel />
            </OakFlex>
          )}
          Delete
        </OakSmallPrimaryButton>
      </OakFlex>
    </OakFlex>
  );
};

export default ClearChatHistory;
