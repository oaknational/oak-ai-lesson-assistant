import { OakFlex, OakLink, OakSpan } from "@oaknational/oak-components";

export function BetaTagPage() {
  return (
    <span className="flex h-[32px] items-center justify-center rounded-full bg-teachersPastelBlue px-9 py-1 text-sm font-semibold">
      Beta
    </span>
  );
}

export const AILA_FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf2AWtTtr4JISeMV4BY5LCMYhDFPz0RPNdXzmy_vjk4BmM69Q/viewform";

export function BetaTagWithFeedback({
  feedbackHref,
}: Readonly<{
  feedbackHref: string;
}>) {
  return (
    <OakFlex $alignItems="center" $gap="spacing-12">
      <BetaTagPage />
      <OakLink
        href={feedbackHref}
        color="text-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        <OakSpan $font="body-2" $color="text-primary">
          Feedback will help us improve Aila
        </OakSpan>
      </OakLink>
    </OakFlex>
  );
}
