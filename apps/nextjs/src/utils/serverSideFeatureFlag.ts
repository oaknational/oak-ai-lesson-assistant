import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { aiLogger } from "@oakai/logger";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

const log = aiLogger("feature-flags");

/**
 * Evaluate a feature flag server-side with full user context.
 *
 * Unlike bootstrap flags (evaluated at page load with only auth token claims),
 * this fetches email from Clerk and passes it for local evaluation, enabling
 * flags with email-based targeting rules.
 *
 * Results are cached for 60s to avoid repeated Clerk API calls.
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
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress;

    const isFeatureFlagEnabled =
      (await posthogAiBetaServerClient.isFeatureEnabled(featureFlagId, userId, {
        personProperties: { email },
      })) ?? false;

    await kv.set(cacheKey, isFeatureFlagEnabled.toString(), { ex: 60 });

    return isFeatureFlagEnabled;
  } catch (e) {
    log.error(`Error checking feature flag ${featureFlagId}:`, e);
    return false;
  }
}
