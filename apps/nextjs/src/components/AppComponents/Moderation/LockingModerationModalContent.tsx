import {
  OakBox,
  OakFlex,
  OakHeading,
  OakIcon,
  OakInlineBanner,
  OakLink,
  OakLoadingSpinner,
  OakMultilineText,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
  OakSpan,
} from "@oaknational/oak-components";

export type LockingModerationModalContentProps = Readonly<{
  onClose: () => void;
  heading: string;
  body: string;
  showFeedback: boolean;
  setShowFeedback: (value: boolean) => void;
  comment: string;
  setComment: (value: string) => void;
  hasSubmitted: boolean;
  isValid: boolean;
  handleSubmit: () => void;
  isLoading: boolean;
}>;

export function LockingModerationModalContent({
  onClose,
  heading,
  body,
  showFeedback,
  setShowFeedback,
  comment,
  setComment,
  hasSubmitted,
  isValid,
  handleSubmit,
  isLoading,
}: LockingModerationModalContentProps) {
  const shouldShowFeedbackForm = showFeedback && !hasSubmitted;
  return (
    <>
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
            onChange={(e) => setComment(e.target.value)}
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
    </>
  );
}
