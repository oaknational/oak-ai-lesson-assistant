"use client";

import { useCallback, useTransition } from "react";
import { toast } from "react-hot-toast";

import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";
import { useRouter } from "next/navigation";

import { useDialog } from "@/components/AppComponents/DialogContext";
import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

import ModalFooterButtons from "./ModalFooterButtons";

const ClearChatHistory = ({
  closeDialog,
}: Readonly<{ closeDialog: () => void }>) => {
  const router = useRouter();

  const { setOpenSidebar } = useDialog();
  const handleCloseDialog = useCallback(() => {
    closeDialog();
    setOpenSidebar(true);
  }, [closeDialog, setOpenSidebar]);

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
  const handleDeleteChat = () => {
    return (
      <OakPrimaryButton
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
      </OakPrimaryButton>
    );
  };
  return (
    <OakFlex
      $flexDirection="column"
      $justifyContent="center"
      $gap="space-between-m"
    >
      <OakP $textAlign="center">
        This will permanently delete all of your lesson history.
      </OakP>
      <ModalFooterButtons
        closeDialog={handleCloseDialog}
        actionButtonStates={handleDeleteChat}
      />
    </OakFlex>
  );
};

export default ClearChatHistory;
