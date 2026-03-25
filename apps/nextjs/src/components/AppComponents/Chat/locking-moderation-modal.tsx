import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import {
  OakFlex,
  OakHeading,
  OakIcon,
  OakInlineBanner,
  OakLink,
  OakModalCenter,
  OakMultilineText,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import { useModerationFeedbackSurvey } from "@/hooks/surveys/useModerationFeedbackSurvey";

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
      <OakIcon iconName="warning" $width="spacing-48" $height="spacing-48" />
      <OakFlex
        $pb="spacing-56"
        $width="100%"
        $flexDirection="column"
        $alignItems="flex-start"
        $justifyContent="center"
        $gap="spacing-32"
      >
        <OakHeading $font={["heading-5", "heading-5", "heading-4"]} tag="h1">
          {heading}
        </OakHeading>

        {!showFeedback && !hasSubmitted && (
          <OakP $font="body-2">
            {body}{" "}
            <OakLink onClick={() => setShowFeedback(true)}>
              provide feedback
            </OakLink>
            .
          </OakP>
        )}

        {showFeedback && !hasSubmitted && (
          <OakMultilineText
            $height={"spacing-120"}
            charLimit={500}
            initialValue={comment}
            onTextAreaChange={setComment}
            placeholder="Your feedback"
          />
        )}

        {hasSubmitted && (
          <OakInlineBanner
            isOpen
            type="success"
            variant="large"
            title="Thank you"
            message="Your feedback has been submitted"
            $width={"100%"}
          />
        )}

        <OakSecondaryLink
          element="a"
          href="https://support.thenational.academy/ailas-safety-guardrails"
          target="_blank"
          rel="noopener noreferrer"
          iconName="external"
          isTrailingIcon
        >
          Learn more about our safety guardrails.
        </OakSecondaryLink>

        {showFeedback && !hasSubmitted ? (
          <OakPrimaryButton onClick={handleSubmit} disabled={!isValid}>
            Submit feedback
          </OakPrimaryButton>
        ) : (
          <OakPrimaryButton onClick={onClose}>
            Create new lesson
          </OakPrimaryButton>
        )}
      </OakFlex>
    </OakModalCenter>
  );
}
