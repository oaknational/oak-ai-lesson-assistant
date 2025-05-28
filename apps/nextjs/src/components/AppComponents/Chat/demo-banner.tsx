"use client";

import * as React from "react";

import { OakBox, OakFlex, OakLink, OakSpan } from "@oaknational/oak-components";

type DemoBannerProps = {
  resourceType: "lessons" | "additionalMaterials";
  monthlyLimit: number;
  remaining?: number;
  contactHref: string;
  "data-testid"?: string;
};

export function DemoBanner({
  resourceType,
  monthlyLimit,
  remaining,
  contactHref,
  "data-testid": testId = "demo-banner",
}: DemoBannerProps) {
  const resourceLabel =
    resourceType === "lessons" ? "lessons" : "additional materials";

  return (
    <OakFlex
      $alignItems={"center"}
      $bb={"border-solid-m"}
      $background={"lemon"}
      $pv={["inner-padding-ssx", "inner-padding-xs"]}
      $ph={"inner-padding-xl"}
      data-testid={testId}
    >
      <OakSpan $font={["body-3", "body-2", "body-1"]}>
        <OakSpan $font={["body-3-bold", "body-2-bold", "body-1-bold"]}>
          Create {monthlyLimit} {resourceLabel} per month •
        </OakSpan>{" "}
        If you are a teacher in the UK,{" "}
        <OakLink
          iconName="chevron-right"
          isTrailingIcon
          color="black"
          href={contactHref}
        >
          contact us for full access
        </OakLink>
      </OakSpan>

      <OakFlex $flexGrow={1} />
      {remaining !== undefined && (
        <OakBox $display={["none", "none", "block"]}>
          <OakSpan $font={"body-1-bold"}>
            {remaining} of {monthlyLimit} {resourceLabel} remaining
          </OakSpan>
        </OakBox>
      )}
    </OakFlex>
  );
}
