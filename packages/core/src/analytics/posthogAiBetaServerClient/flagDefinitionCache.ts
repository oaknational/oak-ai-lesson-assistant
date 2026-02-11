import { aiLogger } from "@oakai/logger";

import { kv } from "@vercel/kv";
import type {
  FlagDefinitionCacheData,
  FlagDefinitionCacheProvider,
} from "posthog-node/experimental";

const KV_KEY = "posthog-feature-flag-definitions";
const CACHE_TTL_SECONDS = 60;

const log = aiLogger("feature-flags");

// Module-scoped cache to avoid double KV calls
// shouldFetchFlagDefinitions populates this, getFlagDefinitions reads it
let cachedDefinitions: FlagDefinitionCacheData | null = null;

/**
 * FlagDefinitionCacheProvider implementation using Vercel KV (Upstash Redis)
 *
 * Caches flag definitions so cold-start serverless functions don't need to
 * fetch from PostHog on every request.
 *
 * @see https://posthog.com/docs/feature-flags/local-evaluation
 */
export const flagDefinitionCacheProvider: FlagDefinitionCacheProvider = {
  /**
   * Check if we need to fetch fresh flag definitions.
   * Also populates cachedDefinitions to avoid double KV call.
   */
  async shouldFetchFlagDefinitions(): Promise<boolean> {
    cachedDefinitions = await kv.get<FlagDefinitionCacheData>(KV_KEY);
    return cachedDefinitions === null;
  },

  /**
   * Return the cached flag definitions.
   * Called after shouldFetchFlagDefinitions, so we can reuse the cached value.
   */
  getFlagDefinitions(): Promise<FlagDefinitionCacheData | undefined> {
    return Promise.resolve(cachedDefinitions ?? undefined);
  },

  /**
   * Store flag definitions after a successful fetch from PostHog.
   */
  async onFlagDefinitionsReceived(
    data: FlagDefinitionCacheData,
  ): Promise<void> {
    cachedDefinitions = data;
    log.info(
      "Flag definitions received:",
      data.flags?.map((f) => f.key).join(", "),
    );
    await kv.set(KV_KEY, data, { ex: CACHE_TTL_SECONDS });
  },

  /**
   * Clean up on shutdown.
   */
  shutdown(): Promise<void> {
    cachedDefinitions = null;
    return Promise.resolve();
  },
};

const ONE_MINUTE = 60 * 1000;
export const featureFlagsPollingInterval = ONE_MINUTE;
