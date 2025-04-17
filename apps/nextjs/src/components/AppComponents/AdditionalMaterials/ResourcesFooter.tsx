import { ReactNode } from "react";

import { OakFlex, OakMaxWidth } from "@oaknational/oak-components";

export type ResourcesFooterProps = { children: ReactNode };

const ResourcesFooter = ({ children }: ResourcesFooterProps) => {
  return (
    <OakMaxWidth
      $position="fixed"
      $bottom="all-spacing-0"
      $background="white"
      $bt="border-solid-m"
      $left="all-spacing-0"
      $right="all-spacing-0"
      $pv="inner-padding-l"
      $ph="inner-padding-xl4"
    >
      <OakFlex $justifyContent="space-between">{children}</OakFlex>
    </OakMaxWidth>
  );
};

export default ResourcesFooter;
