import type { DisplayCategory } from "@oakai/core/src/utils/ailaModeration/helpers";
import { severityPriority } from "@oakai/core/src/utils/ailaModeration/helpers";

import {
  OakModalCenter,
  OakModalCenterBody,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
} from "@oaknational/oak-components";

const footerBySeverity = {
  "content-guidance": "Please check content carefully.",
  "enhanced-scrutiny": "Please check content carefully and verify accuracy.",
  "heightened-caution": "Please review carefully and follow school policy.",
};

function getFooterText(categories: DisplayCategory[]): string {
  const levels = categories.map((c) => c.severityLevel);
  const highest = severityPriority.find((l) => levels.includes(l));
  return footerBySeverity[highest ?? "content-guidance"];
}

function getTitle(categories: DisplayCategory[]): string {
  if (categories.length === 1) {
    return categories[0]!.shortDescription;
  }
  return "Multiple Content Guidance Categories Identified";
}

type ContentGuidanceModalContentProps = Readonly<{
  categories: DisplayCategory[];
  onClose: () => void;
}>;

export function ContentGuidanceModalContent({
  categories,
  onClose,
}: ContentGuidanceModalContentProps) {
  const footer = getFooterText(categories);

  const isSingle = categories.length === 1;
  const body = isSingle
    ? categories[0]!.longDescription
    : `This lesson has been flagged for: ${categories.map((c) => c.shortDescription).join("; ")}.`;

  return (
    <>
      <OakP>{body}</OakP>
      <OakP>{footer}</OakP>
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
