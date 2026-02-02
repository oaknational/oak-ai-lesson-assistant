import { PostHog } from "posthog-node";
import invariant from "tiny-invariant";

import {
  featureFlagsPollingInterval,
  flagDefinitionCacheProvider,
} from "./flagDefinitionCache";

const host = process.env.NEXT_PUBLIC_POSTHOG_HOST as string;
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY ?? "*";
// TODO: Migrate to "Feature Flags Secure API key" which replaces personal API keys
// for local evaluation. See PostHog Settings → Feature Flags → Secure API Key
const personalApiKey = process.env.POSTHOG_PERSONAL_KEY_FLAGS;
invariant(personalApiKey, "POSTHOG_PERSONAL_KEY_FLAGS is required");

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
  personalApiKey: enableLocalEvaluation ? personalApiKey : undefined,
});
