import { PostHog } from "posthog-node";
import invariant from "tiny-invariant";

import {
  cachedFetch,
  featureFlagsPollingInterval,
} from "./featureFlagEvaluation";

const host = process.env.NEXT_PUBLIC_POSTHOG_HOST as string;
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || "*";
const personalApiKey = process.env.POSTHOG_PERSONAL_KEY_FLAGS;
invariant(personalApiKey, "POSTHOG_PERSONAL_KEY_FLAGS is required");

const enableLocalEvaluation = process.env.NODE_ENV !== "test";

/**
 * This is the posthog nodejs client configured to send events to the
 * posthog AI BETA instance.
 */
export const posthogAiBetaServerClient = new PostHog(apiKey, {
  host,

  // We evaluate user feature flags on the server to prevent round-trips to posthog.
  // See https://posthog.com/docs/feature-flags/local-evaluation
  // As we use edge functions, we can't hold the flag definitions in memory.
  // Instead we cache them in KV through a custom fetch implementation.
  fetch: cachedFetch,
  featureFlagsPollingInterval,
  personalApiKey: enableLocalEvaluation ? personalApiKey : undefined,
});
