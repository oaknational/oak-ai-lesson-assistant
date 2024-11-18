"use client";

import { useTransition } from "react";
import { toast } from "react-hot-toast";

import {
  OakFlex,
  OakP,
  OakSmallPrimaryButton,
  OakSmallSecondaryButton,
} from "@oaknational/oak-components";
import { showReportDialog } from "@sentry/nextjs/build/types/server";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

const ClearSingleChatFromChatHistory = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const { mutate, isLoading } =
    trpc.chat.appSessions.deleteChatById.useMutation({
      onSuccess() {
        console.log("Chat history cleared");
        closeDialog();
        localStorage.removeItem("chatIdToDelete");
      },
      onError() {
        console.error("Failed to clear chat history");
      },
    });

  function deleteChatById() {
    const id = localStorage.getItem("chatIdToDelete");
    if (typeof id !== "string") {
      return;
    }
    mutate({ id: id });
  }

  const [isPending, startTransition] = useTransition();

  return (
    <OakFlex
      $flexDirection="column"
      $gap="space-between-m"
      $justifyContent="center"
    >
      <OakP $font="body-1-bold">Are you absolutely sure?</OakP>
      <OakP>
        This will permanently delete your chat history and remove your data from
        our servers.
      </OakP>
      {isLoading ? (
        <OakFlex $justifyContent="center" $alignItems="center">
          <LoadingWheel />
        </OakFlex>
      ) : (
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
                deleteChatById();
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
      )}
    </OakFlex>
  );
};

export default ClearSingleChatFromChatHistory;
