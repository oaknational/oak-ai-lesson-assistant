import type { ReactNode } from "react";

import { OakFlex, OakMaxWidth } from "@oaknational/oak-components";

export type ResourcesFooterProps = { children: ReactNode };

const ResourcesFooter = ({ children }: ResourcesFooterProps) => {
  return (
    <OakMaxWidth
      $position="fixed"
      $bottom="spacing-0"
      $background={"bg-decorative3-very-subdued"}
      $bt="border-solid-m"
      $left={["spacing-24", "spacing-48", "spacing-48"]}
      $right={["spacing-24", "spacing-48", "spacing-48"]}
      $width="unset"
      $zIndex="neutral"
      $maxWidth="spacing-960"
      $ph="spacing-0"
    >
      <OakFlex
        $pa={["spacing-12", "spacing-20"]}
        $ph={["spacing-20"]}
        $width={"100%"}
        $background={"bg-primary"}
      >
        <OakFlex $width={"100%"} $justifyContent="space-between">
          {children}
        </OakFlex>
      </OakFlex>
    </OakMaxWidth>
  );
};

export default ResourcesFooter;
