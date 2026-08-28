"use client";

import { useMemo } from "react";

import {
  OakBox,
  OakFlex,
  OakLink,
  OakScreenReader,
  OakSpan,
} from "@oaknational/oak-components";

import {
  useBootstrappedFeatureFlag,
  useBootstrappedPayload,
} from "@/components/ContextProviders/FeatureFlagProvider";
import {
  STATUS_BANNER_FLAG,
  parseStatusBannerPayload,
} from "@/lib/feature-flags/statusBanner";

type StatusBannerProps = {
  "data-testid"?: string;
};

/**
 * The "we're having problems" strip shown at the top of the page during an incident.
 *
 * Switched on and off from PostHog, so nobody has to deploy to put it up or take it
 * down. There is no dismiss button on purpose: it disappears when the flag goes off.
 *
 * Both the flag and the message come from the server, not the browser's PostHog
 * client, so the banner still reaches people who declined cookies.
 */
export function StatusBanner({
  "data-testid": testId = "status-banner",
}: StatusBannerProps = {}) {
  const isEnabled = useBootstrappedFeatureFlag(STATUS_BANNER_FLAG);
  const rawPayload = useBootstrappedPayload(STATUS_BANNER_FLAG);

  const content = useMemo(
    () => (isEnabled ? parseStatusBannerPayload(rawPayload) : null),
    [isEnabled, rawPayload],
  );

  if (!content) {
    return null;
  }

  const { messageBefore, linkText, href, messageAfter } = content;

  return (
    <OakBox role="status" aria-live="polite" data-testid={testId}>
      <OakFlex
        $alignItems="center"
        $justifyContent="center"
        $bb={"border-solid-m"}
        $background={"bg-decorative6-very-subdued"}
        $pv={["spacing-4", "spacing-8"]}
        $ph={"spacing-24"}
      >
        <OakSpan $font={["body-3", "body-2", "body-1"]}>
          <OakScreenReader>Service status: </OakScreenReader>
          {messageBefore}{" "}
          <OakLink href={href} target="_blank" rel="noopener noreferrer">
            {linkText}
          </OakLink>
          {messageAfter ? ` ${messageAfter}` : null}
        </OakSpan>
      </OakFlex>
    </OakBox>
  );
}
