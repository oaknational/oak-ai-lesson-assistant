import { aiLogger } from "@oakai/logger";
import { kv } from "@vercel/kv";
import { PostHog } from "posthog-node";

const host = process.env.NEXT_PUBLIC_POSTHOG_HOST as string;
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || "*";
const personalApiKey = process.env.POSTHOG_PERSONAL_KEY;

const log = aiLogger("analytics:feature-flags");

const KV_KEY = "posthog-feature-flag-local-evaluation";

const setKv = async (response: Response) => {
  const value = await response.text();
  await kv.set(KV_KEY, value, { ex: 30 });
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

const cachedFetch: PostHog["fetch"] = async (url, options) => {
  if (url.includes("api/feature_flag/local_evaluation")) {
    const kvCachedResponse = await getKv();
    if (kvCachedResponse) {
      log.info("fetched from KV");
      return kvCachedResponse;
    }
    const result = await fetch(url, options);

    if (result.ok) {
      const cachedResult = result.clone();
      await setKv(cachedResult);
      log.info("saved to KV");
    }

    return result;
  }

  if (url.includes("/decide")) {
    log.warn("WARN: feature flag loaded through API");
  }

  return await fetch(url, options);
};

/**
 * This is the posthog nodejs client configured to send events to the
 * posthog AI BETA instance.
 *
 * This is the main Oak posthog instance used for tracking user events
 * on the client-side.
 */
export const posthogAiBetaServerClient = new PostHog(apiKey, {
  host,
  personalApiKey,
  fetch: cachedFetch,
});
