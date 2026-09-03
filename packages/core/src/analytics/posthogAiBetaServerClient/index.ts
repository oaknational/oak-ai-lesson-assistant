import { aiLogger } from "@oakai/logger";

import { PostHog } from "posthog-node";
import invariant from "tiny-invariant";

import {
  featureFlagsPollingInterval,
  flagDefinitionCacheProvider,
} from "./flagDefinitionCache";

const log = aiLogger("feature-flags");

const host = process.env.NEXT_PUBLIC_POSTHOG_HOST as string;
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY ?? "*";
// Feature Flags Secure API Key for local evaluation (phs_... format)
// Generate at: PostHog Settings → Feature Flags → Secure API Key
const featureFlagsApiKey = process.env.POSTHOG_FEATURE_FLAGS_API_KEY;
invariant(featureFlagsApiKey, "POSTHOG_FEATURE_FLAGS_API_KEY is required");

const enableLocalEvaluation = process.env.NODE_ENV !== "test";

/**
 * PostHog Node.js client for the AI Beta project.
 */
export const posthogAiBetaServerClient = new PostHog(apiKey, {
  host,
  disabled: !enableLocalEvaluation,

  // Local evaluation of feature flags to avoid round-trips to PostHog.
  // In serverless, flag definitions are cached in Vercel KV via the cache provider.
  // @see https://posthog.com/docs/feature-flags/local-evaluation
  flagDefinitionCacheProvider,
  featureFlagsPollingInterval,
  personalApiKey: enableLocalEvaluation ? featureFlagsApiKey : undefined,
});

/**
 * How long an instance may reuse its in-memory flag definitions before checking for
 * newer ones.
 *
 * This plus the cache provider's TTL is the worst case delay between changing a flag
 * in PostHog and it taking effect: an instance can pick up a nearly-expired shared
 * copy and then hold it for a full interval. 15s + 30s = 45s.
 */
export const REFRESH_INTERVAL_MS = 15_000;

let lastRefreshAttempt = 0;

/**
 * Bring this instance's flag definitions up to date if they have gone stale.
 *
 * posthog-node only refreshes definitions on a `setTimeout`, and Vercel freezes
 * instances between requests, so that timer can stay paused indefinitely. Without
 * this, a warm instance serves whatever definitions it happened to load first -
 * a flag can be toggled in PostHog and never take effect.
 *
 * Usually this is a Redis read: the SDK only calls PostHog when the shared KV copy
 * has also expired. Throttling matters beyond saving reads, because a forced reload
 * skips the SDK's own backoff, and we don't want to hammer PostHog while it's
 * returning 401s or 429s.
 *
 * A no-op without a personal API key, so it costs nothing in tests.
 */
export async function refreshFlagDefinitionsIfStale(): Promise<void> {
  if (Date.now() - lastRefreshAttempt < REFRESH_INTERVAL_MS) {
    return;
  }

  // Set before awaiting so concurrent requests don't all trigger a refresh, and so
  // a failed refresh waits out the interval rather than retrying on every request.
  lastRefreshAttempt = Date.now();

  try {
    await posthogAiBetaServerClient.reloadFeatureFlags();
  } catch (error) {
    // Stale flags are better than a failed render, so carry on with what we have.
    log.error("Failed to refresh feature flag definitions", error);
  }
}
