import { auth, clerkClient } from "@clerk/nextjs/server";
import { posthogServerClient } from "@oakai/core/src/analytics/posthogServerClient";
import { kv } from "@vercel/kv";

export async function serverSideFeatureFlag(
  featureFlagId: string,
): Promise<boolean> {
  const clerkAuthentication = auth();
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
      const user = await clerkClient.users.getUser(userId);
      const userEmail = user.emailAddresses?.[0]?.emailAddress;

      posthogServerClient.identify({
        distinctId: userId,
        properties: {
          email: userEmail,
        },
      });

      // Flush the queue to ensure the identification is sent
      await posthogServerClient.flush();

      // Mark user as identified in our cache
      await kv.set(identifiedKey, "true", { ex: 86400 }); // Cache for 24 hours
    }

    const isFeatureFlagEnabled =
      (await posthogServerClient.isFeatureEnabled(featureFlagId, userId)) ??
      false;

    await kv.set(cacheKey, isFeatureFlagEnabled.toString(), { ex: 60 });

    return isFeatureFlagEnabled;
  } catch (e) {
    console.error("Error checking feature flag:", e);
    return false;
  }
}
