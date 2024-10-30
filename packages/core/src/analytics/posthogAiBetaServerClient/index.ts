import { PostHog } from "posthog-node";

import {
  cachedFetch,
  featureFlagsPollingInterval,
} from "./featureFlagEvaluation";

const host = process.env.NEXT_PUBLIC_POSTHOG_HOST as string;
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || "*";
const personalApiKey = process.env.POSTHOG_PERSONAL_KEY;

/**
 * This is the posthog nodejs client configured to send events to the
 * posthog AI BETA instance.
 */
export const posthogAiBetaServerClient = new PostHog(apiKey, {
  host,
  personalApiKey,

  // We evaluate user feature flags on the server to prevent round-trips to posthog.
  // See https://posthog.com/docs/feature-flags/local-evaluation
  // As we use edge functions, we can't hold the flag definitions in memory.
  // Instead we cache them in KV through a custom fetch implementation.
  fetch: cachedFetch,
  featureFlagsPollingInterval,
});
