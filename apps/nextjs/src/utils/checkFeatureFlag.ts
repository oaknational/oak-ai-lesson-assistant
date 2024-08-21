import { type PostHog } from "posthog-js";

export function checkFeatureFlag(
  posthogClient: PostHog,
  featureFlagId: string,
): boolean {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT !== "prd") {
    return true;
  }
  return posthogClient.isFeatureEnabled(featureFlagId) ?? false;
}
