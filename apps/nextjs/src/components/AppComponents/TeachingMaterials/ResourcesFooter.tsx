import type { ReactNode } from "react";

import { OakFlex, OakMaxWidth } from "@oaknational/oak-components";

export type ResourcesFooterProps = { children: ReactNode };

const ResourcesFooter = ({ children }: ResourcesFooterProps) => {
  return (
    <OakMaxWidth
      $position="fixed"
      $bottom="all-spacing-0"
      $background={"bg-decorative3-very-subdued"}
      $bt="border-solid-m"
      $left={["space-between-m", "space-between-l", "space-between-l"]}
      $right={["space-between-m", "space-between-l", "space-between-l"]}
      $width="unset"
      $zIndex="neutral"
      $maxWidth="all-spacing-23"
      $ph="inner-padding-none"
    >
      <OakFlex
        $pa={["inner-padding-s", "inner-padding-l"]}
        $ph={["inner-padding-l"]}
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
