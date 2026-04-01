import type { DisplayCategory } from "@oakai/core/src/utils/ailaModeration/helpers";

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

function getTitle(categories: DisplayCategory[]): string {
  if (categories.length === 1) {
    return categories[0]!.shortDescription;
  }
  return "Content guidance";
}

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
      <OakSecondaryLink
        element="a"
        href="https://support.thenational.academy/ailas-safety-guardrails"
        target="_blank"
        rel="noopener noreferrer"
        iconName="external"
        isTrailingIcon
      >
        Learn more about Aila&apos;s safety guardrails.
      </OakSecondaryLink>
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
    <OakModalCenter isOpen={open} onClose={onClose}>
      <OakIcon iconName={"info"} $width="spacing-48" $height="spacing-48" />
      <OakFlex
        $pb="spacing-56"
        $width="100%"
        $flexDirection="column"
        $alignItems="flex-start "
        $justifyContent="center"
        $gap={"spacing-32"}
      >
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
