import { useState } from "react";

import { useUser } from "#clerk/nextjs";
import logger from "@oakai/logger";
import * as Dialog from "@radix-ui/react-dialog";

import { trpc } from "@/utils/trpc";

import FeedbackDialog from "../common/FeedbackDialog";

export const FeedbackDialogRoot = Dialog.Root;
export const FeedbackDialogTrigger = Dialog.Trigger;

type FeedbackDialogProps = {
  flaggedItem?: string;
  closeDialog: () => void;
  judgementId: string;
  flaggedAnswerAndDistractorId: string;
};

function JudgementFeedbackDialog({
  flaggedItem: flaggedItems,
  closeDialog,

  judgementId,
  flaggedAnswerAndDistractorId,
}: Readonly<FeedbackDialogProps>) {
  const [contentIsInappropriate, setContentIsInappropriate] = useState(false);
  const [contentIsFactuallyIncorrect, setContentIsFactuallyIncorrect] =
    useState(false);
  const [contentIsNotHelpful, setContentIsNotHelpful] = useState(false);
  const [typedFeedback, setTypedFeedback] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const user = useUser();

  const giveFlaggedFeedback = trpc.judgement.flag.useMutation();

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

    const feedBackObject = {
      judgementId: judgementId,
      flaggedAnswerAndDistractorId: flaggedAnswerAndDistractorId,
      user: {
        email: email,
      },
      feedback: {
        typedFeedback: typedFeedback,
        contentIsInappropriate: contentIsInappropriate,
        contentIsFactuallyIncorrect: contentIsFactuallyIncorrect,
        contentIsNotHelpful: contentIsNotHelpful,
      },
    };

    const result = await giveFlaggedFeedback.mutateAsync(feedBackObject);
    if (typeof result === "boolean" && result) {
      setHasSubmitted(true);
    } else {
      console.log("Error submitting feedback", result);
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

export default JudgementFeedbackDialog;