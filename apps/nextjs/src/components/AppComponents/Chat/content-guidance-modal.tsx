import type { DisplayCategory } from "@oakai/core/src/utils/ailaModeration/helpers";

import {
  OakModalCenter,
  OakModalCenterBody,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
} from "@oaknational/oak-components";

function getTitle(categories: DisplayCategory[]): string {
  if (categories.length === 1) {
    return categories[0]!.shortDescription;
  }
  return "Multiple Content Guidance Categories Identified";
}

function getBody(categories: DisplayCategory[]): string {
  if (categories.length === 1) {
    return categories[0]!.longDescription;
  }
  return `This lesson has been flagged under multiple content guidance categories: ${categories.map((c) => c.shortDescription).join("; ")}. These topics may be sensitive or require careful handling in the classroom. Please review the content thoroughly to ensure it is age-appropriate, factually accurate, and aligned with your school's policies.`;
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
      <OakP>{getBody(categories)}</OakP>
      <OakSecondaryLink
        element="a"
        href="https://support.thenational.academy/ailas-safety-guardrails"
        target="_blank"
        rel="noopener noreferrer"
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
  const title = getTitle(categories);

  return (
    <OakModalCenter isOpen={open} onClose={onClose}>
      <OakModalCenterBody iconName="info" title={title}>
        <ContentGuidanceModalContent
          categories={categories}
          onClose={onClose}
        />
      </OakModalCenterBody>
    </OakModalCenter>
  );
}
