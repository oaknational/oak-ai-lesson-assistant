import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import * as Sentry from "@sentry/react";

import {
  ModerationFeedbackForm,
  ModerationFeedbackFormProps,
} from "@/components/AppComponents/FeedbackForms/ModerationFeedbackForm";

import { dialogOverlay } from "../../DialogControl/dialogStyles";

type OpenModalProps = Omit<ModerationFeedbackFormProps, "chatId">;
export type ModerationModalHelpers = {
  openModal: (props: OpenModalProps) => void;
  closeModal: () => void;
  moderationFeedbackFormProps: ModerationFeedbackFormProps | null;
};
export function useModerationModal({
  chatId,
}: {
  chatId?: string;
}): ModerationModalHelpers {
  const [moderationFeedbackFormProps, setModerationFeedbackFormProps] =
    useState<ModerationFeedbackFormProps | null>(null);

  return {
    openModal: (props: Omit<OpenModalProps, "chatId">) => {
      if (!chatId) {
        Sentry.setContext("ModerationModalHelpers", {
          props,
          chatId,
        });
        Sentry.captureException(
          new Error("Failed to open moderation feedback form without chatId"),
        );
        return;
      }
      setModerationFeedbackFormProps({ chatId, ...props });
    },
    closeModal: () => {
      setModerationFeedbackFormProps(null);
    },
    moderationFeedbackFormProps,
  };
}

/**
 * This component is used to collect user comments on moderation flags with "sensitive" classification.
 */
const ModerationFeedbackModal = ({
  moderationFeedbackFormProps,
}: Readonly<{
  moderationFeedbackFormProps: ModerationFeedbackFormProps | null;
}>) => {
  return (
    <Dialog.Root open={Boolean(moderationFeedbackFormProps)}>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlay({ opacity: true })} />
        <Dialog.Content
          className={
            "absolute inset-0 top-0 z-50 flex items-center justify-center"
          }
        >
          {moderationFeedbackFormProps && (
            <ModerationFeedbackForm {...moderationFeedbackFormProps} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ModerationFeedbackModal;
