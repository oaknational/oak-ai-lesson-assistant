import { PostHog } from "posthog-node";

const host = process.env.NEXT_PUBLIC_POSTHOG_HOST as string;
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY ?? "*";

/**
 * This is the posthog nodejs client configured to send events to the
 * posthog AI BETA instance.
 */
export const posthogAiBetaServerClient = new PostHog(apiKey, {
  host,
});
