import {
  OakBox,
  OakFlex,
  OakLink,
  OakSpan,
  OakTagFunctional,
} from "@oaknational/oak-components";

export const AILA_FEEDBACK_FORM_URL =
  process.env.NEXT_PUBLIC_AILA_FEEDBACK_FORM_URL ??
  "https://survey.hsforms.com/184ua72b5RtOD9SDPq4BKKQbvumd";

export function BetaTagWithFeedback({
  feedbackHref,
}: Readonly<{
  feedbackHref: string;
}>) {
  return (
    <OakFlex $font="body-3" $alignItems="center" $gap="spacing-12">
      <OakTagFunctional
        $borderRadius={"border-radius-l"}
        $background={"bg-decorative3-main"}
        label={"Beta"}
        $font={"body-3-bold"}
        $pv="spacing-4"
        $ph="spacing-12"
      />
      <OakBox>
        <OakLink href={feedbackHref} target="_blank" rel="noopener noreferrer">
          <OakSpan $font="body-3">Your feedback</OakSpan>
        </OakLink>
        <OakSpan $font="body-3">{` will help us improve Aila`}</OakSpan>
      </OakBox>
    </OakFlex>
  );
}
