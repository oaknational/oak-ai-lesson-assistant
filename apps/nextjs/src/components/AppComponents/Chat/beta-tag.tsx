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
      <span className="flex items-center justify-center rounded-[12px] bg-teachersPastelBlue px-[8px] py-[6px] text-sm font-semibold leading-5">
        Beta
      </span>
      <OakLink
        href={feedbackHref}
        color="text-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        <OakSpan $font="body-3" $color="text-primary">
          Feedback will help us improve Aila
        </OakSpan>
      </OakLink>
    </OakFlex>
  );
}
