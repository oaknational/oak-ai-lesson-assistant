import { useState } from "react";

import { useUser } from "#clerk/nextjs";
import { GenerationPart } from "@oakai/core/src/types";
import { legacyLogger as logger } from "@oakai/logger";
import * as Dialog from "@radix-ui/react-dialog";

import { trpc } from "@/utils/trpc";

import FeedbackDialog from "../FeedbackDialog";

export const FeedbackDialogRoot = Dialog.Root;
export const FeedbackDialogTrigger = Dialog.Trigger;

type FeedbackDialogProps = {
  flaggedItem?: GenerationPart<unknown> | GenerationPart<unknown>[] | null;
  closeDialog: () => void;
  sessionId: string | null;
};

function GenerationFeedbackDialog({
  flaggedItem: flaggedItems,
  closeDialog,
  sessionId,
}: Readonly<FeedbackDialogProps>) {
  const [contentIsInappropriate, setContentIsInappropriate] = useState(false);
  const [contentIsFactuallyIncorrect, setContentIsFactuallyIncorrect] =
    useState(false);
  const [contentIsNotHelpful, setContentIsNotHelpful] = useState(false);
  const [typedFeedback, setTypedFeedback] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const user = useUser();

  const giveFlaggedFeedback = trpc.generations.flag.useMutation();

  const sendFeedback = async () => {
    const email = user?.user?.emailAddresses[0]?.emailAddress;

    if (!email) {
      // This case really shouldn't happen as the user should be logged in
      logger.error("User attempted to give feedback without an email address");
      return null;
    }

    if (!flaggedItems) {
      logger.error("User attempted to give feedback but flaggedItem was null");
      return null;
    }

    if (!sessionId) {
      logger.error("User attempted to give feedback but sessionId was null");
      return null;
    }

    let flattenedFlaggedItem;

    if (Array.isArray(flaggedItems)) {
      const firstFlaggedItem = flaggedItems[0];
      if (!firstFlaggedItem) {
        throw new Error(
          "Attempted to flag an item but provided an empty list of flaggedItems",
        );
      }

      flattenedFlaggedItem = {
        ...firstFlaggedItem,
        value: flaggedItems.map((item) => item.value),
      };
    } else {
      flattenedFlaggedItem = flaggedItems;
    }

    const feedBackObject = {
      sessionId,
      user: {
        email: email,
      },
      feedback: {
        typedFeedback: typedFeedback,
        contentIsInappropriate: contentIsInappropriate,
        contentIsFactuallyIncorrect: contentIsFactuallyIncorrect,
        contentIsNotHelpful: contentIsNotHelpful,
      },
      flaggedItem: flattenedFlaggedItem,
    };

    const result = await giveFlaggedFeedback.mutateAsync(feedBackObject);
    if (result) {
      setHasSubmitted(true);
    }
  };

  return (
    <FeedbackDialog
      hasSubmitted={hasSubmitted}
      closeDialog={closeDialog}
      setTypedFeedback={setTypedFeedback}
      setContentIsInappropriate={setContentIsInappropriate}
      setContentIsFactuallyIncorrect={setContentIsFactuallyIncorrect}
      setContentIsNotHelpful={setContentIsNotHelpful}
      sendFeedback={sendFeedback}
      setHasSubmitted={setHasSubmitted}
    />
  );
}

export default GenerationFeedbackDialog;
