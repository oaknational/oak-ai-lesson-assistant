import { useEffect, useState } from "react";

import { aiLogger } from "@oakai/logger";

import useAnalytics from "@/lib/analytics/useAnalytics";

const log = aiLogger("feature-flags");

export function useClientSideFeatureFlag(flag: string): boolean {
  const { posthogAiBetaClient: client } = useAnalytics();

  const [bootstrappedFlag] = useState(client.isFeatureEnabled(flag));
  const [featureEnabled, setFeatureEnabled] = useState<boolean | undefined>(
    bootstrappedFlag,
  );
  log.info(`Flag ${flag} bootstrapped as ${bootstrappedFlag}`);

  useEffect(() => {
    if (typeof bootstrappedFlag === "boolean") {
      // Avoid flash on load if the bootstrapped flag is stale
      log.info(`Flag update ignored, flag ${flag} is already bootstrapped`);
      return;
    }

    const isDebug = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true";
    if (isDebug) {
      log.info(`Feature flag ${flag} is enabled in debug mode`);
      setFeatureEnabled(true);
      return;
    }

    log.info(`Fetching feature flag ${flag}`);
    return client.onFeatureFlags(() => {
      setFeatureEnabled(client.isFeatureEnabled(flag));
    });
  }, [client, flag, bootstrappedFlag]);

  return featureEnabled ?? false;
}
