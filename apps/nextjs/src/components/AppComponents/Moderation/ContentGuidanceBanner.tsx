import { useState } from "react";

import {
  type DisplayCategory,
  type SeverityLevel,
  getHighestSeverity,
} from "@oakai/core/src/utils/ailaModeration/severityLevel";

import { OakInlineBanner, OakSecondaryLink } from "@oaknational/oak-components";

import { ContentGuidanceModal } from "./ContentGuidanceModalContent";

const severityDisplay: Record<
  SeverityLevel,
  { bannerText: string; linkText: string }
> = {
  "content-guidance": {
    bannerText:
      "The content in this lesson may require additional consideration before delivery.",
    linkText: "View content guidance.",
  },
  "enhanced-scrutiny": {
    bannerText: "This lesson includes content that requires enhanced scrutiny.",
    linkText: "View details.",
  },
  "heightened-caution": {
    bannerText:
      "This lesson includes content that requires heightened professional caution.",
    linkText: "View details.",
  },
};

type ContentGuidanceBannerProps = Readonly<{
  categories: DisplayCategory[];
}>;

export function ContentGuidanceBanner({
  categories,
}: ContentGuidanceBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { bannerText, linkText } =
    severityDisplay[getHighestSeverity(categories)];

  return (
    <>
      <OakInlineBanner
        isOpen
        type="alert"
        icon="info"
        message={bannerText}
        title="Content guidance"
        cta={
          <OakSecondaryLink
            element="button"
            onClick={() => setModalOpen(true)}
            iconName="chevron-right"
            isTrailingIcon
          >
            {linkText}
          </OakSecondaryLink>
        }
      />
      <ContentGuidanceModal
        categories={categories}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
