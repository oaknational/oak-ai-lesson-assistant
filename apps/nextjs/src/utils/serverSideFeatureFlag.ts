import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { aiLogger } from "@oakai/logger";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

const log = aiLogger("feature-flags");

export async function serverSideFeatureFlag(
  featureFlagId: string,
): Promise<boolean> {
  const clerkAuthentication = await auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    return false;
  }

  const cacheKey = `feature_flag:${featureFlagId}:${userId}`;
  const cachedResult = await kv.get(cacheKey);

  if (cachedResult !== null) {
    if (cachedResult === "true") {
      return true;
    }
  }

  try {
    // Check if the user has been identified in Posthog
    const identifiedKey = `posthog_identified:${userId}`;
    const isIdentified = await kv.get(identifiedKey);

    if (!isIdentified) {
      // Only fetch user data if not identified
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userEmail = user.emailAddresses?.[0]?.emailAddress;

      await posthogAiBetaServerClient.identifyImmediate({
        distinctId: userId,
        properties: {
          email: userEmail,
        },
      });

      // Mark user as identified in our cache
      await kv.set(identifiedKey, "true", { ex: 86400 }); // Cache for 24 hours
    }

    const isFeatureFlagEnabled =
      (await posthogAiBetaServerClient.isFeatureEnabled(
        featureFlagId,
        userId,
      )) ?? false;

    await kv.set(cacheKey, isFeatureFlagEnabled.toString(), { ex: 60 });

    return isFeatureFlagEnabled;
  } catch (e) {
    log.error("Error checking feature flag:", e);
    return false;
  }
}
