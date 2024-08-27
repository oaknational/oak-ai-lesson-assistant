import { PostHog } from "posthog-node";

const host = process.env.NEXT_PUBLIC_POSTHOG_HOST as string;
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || "*";

export const posthogServerClient = new PostHog(apiKey, { host });

export const createPosthogClient = () => {
  return new PostHog(apiKey, { host });
};
