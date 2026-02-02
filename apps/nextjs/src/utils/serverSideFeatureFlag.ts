import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { aiLogger } from "@oakai/logger";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

const log = aiLogger("feature-flags");

/**
 * Ensure PostHog has up-to-date user properties for server-side evaluation.
 * Cached for 24 hours to avoid repeated Clerk API calls.
 */
async function ensureUserIdentified(userId: string): Promise<void> {
  const identifiedKey = `posthog_identified:${userId}`;
  const isIdentified = await kv.get(identifiedKey);

  if (!isIdentified) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses?.[0]?.emailAddress;

    await posthogAiBetaServerClient.identifyImmediate({
      distinctId: userId,
      properties: {
        email: userEmail,
      },
    });

    await kv.set(identifiedKey, "true", { ex: 86400 });
  }
}

/**
 * Evaluate a feature flag server-side with full user context.
 *
 * Unlike bootstrap flags (evaluated at page load with only auth token claims),
 * this can evaluate flags with email-based targeting rules via server fallback.
 */
export async function serverSideFeatureFlag(
  featureFlagId: string,
): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  const cacheKey = `feature_flag:${featureFlagId}:${userId}`;
  const cachedResult = await kv.get(cacheKey);

  if (cachedResult !== null) {
    return cachedResult === "true";
  }

  try {
    await ensureUserIdentified(userId);

    const isFeatureFlagEnabled =
      (await posthogAiBetaServerClient.isFeatureEnabled(
        featureFlagId,
        userId,
      )) ?? false;

    await kv.set(cacheKey, isFeatureFlagEnabled.toString(), { ex: 60 });

    return isFeatureFlagEnabled;
  } catch (e) {
    log.error(`Error checking feature flag ${featureFlagId}:`, e);
    return false;
  }
}
