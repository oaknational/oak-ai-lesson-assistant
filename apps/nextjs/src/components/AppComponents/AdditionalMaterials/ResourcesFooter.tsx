import type { ReactNode } from "react";

import { OakFlex, OakMaxWidth } from "@oaknational/oak-components";

export type ResourcesFooterProps = { children: ReactNode };

const ResourcesFooter = ({ children }: ResourcesFooterProps) => {
  return (
    <OakMaxWidth
      $position="fixed"
      $bottom="all-spacing-0"
      $background="white"
      $bt="border-solid-m"
      $left="all-spacing-4"
      $right="all-spacing-4"
      $width="unset"
      $pv="inner-padding-l"
      $ph={["inner-padding-xl", "inner-padding-xl4"]}
      $zIndex="neutral"
      $maxWidth="all-spacing-23"
    >
      <OakFlex $justifyContent="space-between">{children}</OakFlex>
    </OakMaxWidth>
  );
};

export default ResourcesFooter;
