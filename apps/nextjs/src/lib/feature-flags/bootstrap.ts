"use server";

import { auth } from "@clerk/nextjs/server";
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { aiLogger } from "@oakai/logger";
import cookie from "cookie";
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import invariant from "tiny-invariant";

const log = aiLogger("feature-flags");

/**
 * We use posthog feature flags to toggle functionality without deploying code changes.
 * Fething feature flags on the frontend hasn't been reliable for us:
 * - you have to wait for a round trip to the posthog API
 * - we currently have a bug where denying cookie consent prevents feature flags from loading
 *
 * Instead, we can bootstrap feature flags by evaluating them on the server.
 * https://posthog.com/docs/feature-flags/bootstrapping
 */

function getDistinctIdFromCookie(headers: ReadonlyHeaders) {
  const cookieHeader = headers.get("cookie");
  invariant(cookieHeader, "No cookie header");
  const cookies = cookie.parse(cookieHeader) as Record<string, string>;
  const phCookieKey = `ph_${process.env.NEXT_PUBLIC_POSTHOG_API_KEY}_posthog`;
  const phCookie = cookies[phCookieKey];
  if (!phCookie) {
    return null;
  }
  return (JSON.parse(phCookie) as { distinct_id: string })["distinct_id"];
}

export async function getBootstrappedFeatures(headers: ReadonlyHeaders) {
  const { userId, sessionClaims } = auth();

  const distinctId = userId ?? getDistinctIdFromCookie(headers) ?? "0";

  const personProperties = sessionClaims?.labs?.featureFlagGroup
    ? { featureFlagGroup: sessionClaims.labs.featureFlagGroup }
    : undefined;
  log.info("Evaluating", distinctId, personProperties ?? "(no properties)");

  const features = await posthogAiBetaServerClient.getAllFlags(distinctId, {
    // Only bootstrap flags which don't depend on PII
    onlyEvaluateLocally: true,
    personProperties,
  });

  log.info("Bootstrapping feature flags", features);
  return features;
}
