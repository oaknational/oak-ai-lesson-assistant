import type { DisplayCategory } from "@oakai/core/src/utils/ailaModeration/severityLevel";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakIcon,
  OakModalCenter,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
  OakSpan,
} from "@oaknational/oak-components";

type ContentGuidanceModalContentProps = Readonly<{
  categories: DisplayCategory[];
  onClose: () => void;
}>;

export function ContentGuidanceModalContent({
  categories,
  onClose,
}: ContentGuidanceModalContentProps) {
  return (
    <>
      {categories.map((category) => (
        <OakBox key={category.shortDescription} $font="body-2">
          <OakP $font="body-2">
            <OakSpan $font="body-2-bold">
              {category.shortDescription}
              {": "}
            </OakSpan>{" "}
            {category.longDescription}
          </OakP>
        </OakBox>
      ))}
      <OakP $font="body-2">
        Please check content carefully. Learn more about{" "}
        <OakSecondaryLink
          element="a"
          href="https://support.thenational.academy/ailas-safety-guardrails"
          target="_blank"
          rel="noopener noreferrer"
        >
          Aila&apos;s safety guardrails.
        </OakSecondaryLink>
      </OakP>
      <OakPrimaryButton onClick={onClose}>Continue</OakPrimaryButton>
    </>
  );
}

type ContentGuidanceModalProps = Readonly<{
  categories: DisplayCategory[];
  open: boolean;
  onClose: () => void;
}>;

export function ContentGuidanceModal({
  categories,
  open,
  onClose,
}: ContentGuidanceModalProps) {
  return (
    <OakModalCenter
      isOpen={open}
      onClose={onClose}
      modalInnerFlexProps={{
        $ph: ["spacing-48", "spacing-80"],
        $pb: ["spacing-32", "spacing-56"],
      }}
    >
      <OakFlex
        $width="100%"
        $flexDirection="column"
        $alignItems="flex-start"
        $justifyContent="center"
        $gap={"spacing-32"}
      >
        <OakBox className="hidden md:block">
          <OakIcon iconName={"info"} $width="spacing-48" $height="spacing-48" />
        </OakBox>
        <OakHeading $font={["heading-5", "heading-5", "heading-4"]} tag="h1">
          {"Content guidance"}
        </OakHeading>
        <ContentGuidanceModalContent
          categories={categories}
          onClose={onClose}
        />
      </OakFlex>
    </OakModalCenter>
  );
}
