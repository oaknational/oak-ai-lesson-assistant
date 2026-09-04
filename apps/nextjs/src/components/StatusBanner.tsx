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

/** The banner's current height. Unset while it's hidden, so the offset below is 0. */
const HEIGHT_CSS_VAR = "--status-banner-height";

/** How far to move something down to clear the banner. */
export const STATUS_BANNER_OFFSET = `var(${HEIGHT_CSS_VAR}, 0px)`;

/**
 * Every mounted banner's height. A route change mounts the next page's banner before
 * unmounting the current one, so the variable is derived from all of them - otherwise
 * the old banner's cleanup would clear the height the new one had just set.
 */
const heights = new Map<Element, number>();
let published = "";

function syncHeight() {
  const root = document.documentElement;

  if (heights.size === 0) {
    published = "";
    root.style.removeProperty(HEIGHT_CSS_VAR);
    return;
  }

  // Writing to the root restyles the whole document, and the observer fires on every
  // width change, so skip the writes that wouldn't change anything.
  const next = `${Math.max(...heights.values())}px`;
  if (next !== published) {
    published = next;
    root.style.setProperty(HEIGHT_CSS_VAR, next);
  }
}

type StatusBannerProps = {
  "data-testid"?: string;
};

/**
 * The "we're having problems" strip shown at the top of the page during an incident.
 *
 * Switched on and off from PostHog, so nobody has to deploy to put it up or take it
 * down. There is no dismiss button on purpose: it disappears when the flag goes off.
 *
 * Both the flag and the message are evaluated on the server, so the banner still
 * reaches people who declined cookies.
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

    heights.set(element, element.offsetHeight);
    syncHeight();

    const observer = new ResizeObserver(([entry]) => {
      // From the entry, not a fresh offsetHeight read, which would force a re-layout.
      heights.set(
        element,
        entry?.borderBoxSize[0]?.blockSize ?? element.offsetHeight,
      );
      syncHeight();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      heights.delete(element);
      syncHeight();
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
 * Sits above a layout's content to push it clear of the banner. Zero height when the
 * banner is hidden.
 */
export function StatusBannerSpacer() {
  return <div aria-hidden style={SPACER_STYLE} />;
}
