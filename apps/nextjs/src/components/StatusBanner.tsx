"use client";

import { useEffect, useMemo, useRef } from "react";

import {
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

/**
 * How tall the banner currently is, in a CSS variable so layouts can move their
 * content down to make room for it. It is unset when the banner is hidden, so
 * `var(--status-banner-height, 0px)` gives 0 and nothing moves.
 */
const HEIGHT_CSS_VAR = "--status-banner-height";

/**
 * How far down to move something to clear the banner. Use this rather than writing
 * the variable name out again, so renaming it can't silently leave a layout behind.
 */
export const STATUS_BANNER_OFFSET = `var(${HEIGHT_CSS_VAR}, 0px)`;

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
  const ref = useRef<HTMLDivElement>(null);

  const content = useMemo(
    () => (isEnabled ? parseStatusBannerPayload(rawPayload) : null),
    [isEnabled, rawPayload],
  );
  const isVisible = content !== null;

  // Measured rather than hardcoded, because the banner gets taller when the message
  // wraps onto two lines on a narrow screen.
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const root = document.documentElement;
    let published = "";
    // Writing to the root restyles the whole document, and the observer also fires
    // on every width change, so skip the writes that wouldn't change anything.
    const publish = (height: number) => {
      const next = `${height}px`;
      if (next === published) {
        return;
      }
      published = next;
      root.style.setProperty(HEIGHT_CSS_VAR, next);
    };

    publish(element.offsetHeight);
    const observer = new ResizeObserver(([entry]) => {
      // From the entry, not a fresh offsetHeight read, which would force a reflow.
      publish(entry?.borderBoxSize[0]?.blockSize ?? element.offsetHeight);
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      root.style.removeProperty(HEIGHT_CSS_VAR);
    };
  }, [isVisible]);

  if (!content) {
    return null;
  }

  const { messageBefore, linkText, href, messageAfter } = content;

  return (
    <OakFlex
      ref={ref}
      role="status"
      aria-live="polite"
      data-testid={testId}
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
  );
}

const SPACER_STYLE = { height: STATUS_BANNER_OFFSET };

/**
 * An empty div the same height as the banner. Drop it above a layout's content to
 * push that content down. It has no height when the banner is hidden.
 */
export function StatusBannerSpacer() {
  return <div aria-hidden style={SPACER_STYLE} />;
}
