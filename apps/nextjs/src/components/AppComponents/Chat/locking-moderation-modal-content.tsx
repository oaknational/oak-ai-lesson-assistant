import {
  OakFlex,
  OakHeading,
  OakIcon,
  OakInlineBanner,
  OakLink,
  OakMultilineText,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
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
}: LockingModerationModalContentProps) {
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
    </>
  );
}
