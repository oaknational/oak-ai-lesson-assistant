import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { OakModalCenter } from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import { useModerationFeedbackSurvey } from "@/hooks/surveys/useModerationFeedbackSurvey";

import { LockingModerationModalContent } from "./locking-moderation-modal-content";

type LockingModerationModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  chatId: string;
  heading: string;
  body: string;
  moderation: PersistedModerationBase;
}>;

export function LockingModerationModal({
  open,
  onClose,
  heading,
  body,
  chatId,
  moderation,
}: LockingModerationModalProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const { onSubmit, comment, setComment, hasSubmitted, isValid } =
    useModerationFeedbackSurvey({ chatId, moderation });

  const handleSubmit = useCallback(() => {
    onSubmit().catch((error) => {
      toast.error("Failed to submit feedback");
      Sentry.captureException(error, { extra: { chatId } });
    });
  }, [onSubmit, chatId]);

  return (
    <OakModalCenter isOpen={open} onClose={onClose}>
      <LockingModerationModalContent
        onClose={onClose}
        heading={heading}
        body={body}
        showFeedback={showFeedback}
        setShowFeedback={setShowFeedback}
        comment={comment}
        setComment={setComment}
        hasSubmitted={hasSubmitted}
        isValid={isValid}
        handleSubmit={handleSubmit}
      />
    </OakModalCenter>
  );
}
