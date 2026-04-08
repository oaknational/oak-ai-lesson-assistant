import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakIcon,
  OakInlineBanner,
  OakLink,
  OakLoadingSpinner,
  OakModalCenter,
  OakMultilineText,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
  OakSpan,
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
  const { onSubmit, comment, setComment, hasSubmitted, isValid, isLoading } =
    useModerationFeedbackSurvey({ chatId, moderation });

  const shouldShowFeedbackForm = showFeedback && !hasSubmitted;

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
        <OakHeading $font={"heading-5"} tag="h1">
          {heading}
        </OakHeading>

        {!showFeedback && !hasSubmitted && (
          <OakP $font="body-2">
            {body}{" "}
            <OakLink
              style={{ color: "inherit" }}
              onClick={() => setShowFeedback(true)}
            >
              provide feedback
            </OakLink>
            .
          </OakP>
        )}
        {shouldShowFeedbackForm && isLoading && <OakLoadingSpinner />}
        {shouldShowFeedbackForm && !isLoading && (
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
        <OakBox>
          <OakSpan $font="body-2" $mb="spacing-16">
            {`Please check content carefully. Learn more about `}
            <OakSecondaryLink
              element="a"
              href="https://support.thenational.academy/ailas-safety-guardrails"
              target="_blank"
              rel="noopener noreferrer"
              iconName="external"
              isTrailingIcon
            >
              Aila's safety guardrails.
            </OakSecondaryLink>
          </OakSpan>
        </OakBox>

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
