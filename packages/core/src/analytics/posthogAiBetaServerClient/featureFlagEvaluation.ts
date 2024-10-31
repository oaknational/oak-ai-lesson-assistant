import { aiLogger } from "@oakai/logger";
import { kv } from "@vercel/kv";
import type { PostHog } from "posthog-node";

const KV_KEY = "posthog-feature-flag-local-evaluation";

const log = aiLogger("analytics:feature-flags");

const setKv = async (response: Response) => {
  const value = await response.text();
  await kv.set(KV_KEY, value, { ex: 60 });
};

const getKv = async () => {
  const value = await kv.get(KV_KEY);
  if (!value) {
    return null;
  }
  return {
    status: 200,
    json: () => Promise.resolve(value),
    text: () => Promise.resolve(JSON.stringify(value)),
  };
};

export const cachedFetch: PostHog["fetch"] = async (url, options) => {
  if (url.includes("api/feature_flag/local_evaluation")) {
    const kvCachedResponse = await getKv();
    if (kvCachedResponse) {
      log.info("Evaluations fetched from KV");
      return kvCachedResponse;
    }
    const result = await fetch(url, options);

    if (result.ok) {
      const cachedResult = result.clone();
      await setKv(cachedResult);
      log.info("Evaluations cached to KV");
    } else {
      log.error("failed to load evaluations", { status: result.status });
    }

    return result;
  }

  if (url.includes("/decide")) {
    log.warn("WARN: feature flag loaded through API");
  }

  return await fetch(url, options);
};

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
export const featureFlagsPollingInterval =
  // prevent polling timeout from stacking when HMR replaces posthogAiBetaServerClient
  process.env.NODE_ENV === "development" ? ONE_DAY : ONE_MINUTE;
