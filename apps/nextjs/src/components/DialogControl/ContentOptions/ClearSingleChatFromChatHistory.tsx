"use client";

import { useCallback, useTransition } from "react";

import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import { useDialog } from "@/components/AppComponents/DialogContext";
import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

import ModalFooterButtons from "./ModalFooterButtons";

const ClearSingleChatFromChatHistory = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const { dialogProps, setDialogProps, setOpenSidebar } = useDialog();
  const { mutate, isLoading } =
    trpc.chat.appSessions.deleteChatById.useMutation({
      onSuccess() {
        closeDialog();
        setDialogProps({});
      },
      onError() {
        Sentry.captureMessage("Error deleting chat");
      },
    });

  const handleCloseDialog = useCallback(() => {
    closeDialog();
    setOpenSidebar(true);
  }, [closeDialog, setOpenSidebar]);

  function deleteChatById() {
    const id = dialogProps?.chatIdToDelete;
    if (typeof id !== "string") {
      return;
    }
    mutate({ id: id });
  }

  const [isPending, startTransition] = useTransition();
  const handleDeleteChat = () => {
    return (
      <OakPrimaryButton
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
      </OakPrimaryButton>
    );
  };
  return (
    <OakFlex
      $flexDirection="column"
      $gap="space-between-m"
      $justifyContent="center"
    >
      <OakP>This will permanently delete this lesson.</OakP>
      {isLoading ? (
        <OakFlex $justifyContent="center" $alignItems="center">
          <LoadingWheel />
        </OakFlex>
      ) : (
        <ModalFooterButtons
          closeDialog={handleCloseDialog}
          actionButtonStates={handleDeleteChat}
        />
      )}
    </OakFlex>
  );
};

export default ClearSingleChatFromChatHistory;
