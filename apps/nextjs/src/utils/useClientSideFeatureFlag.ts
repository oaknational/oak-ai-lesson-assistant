import { useEffect, useState } from "react";

import { aiLogger } from "@oakai/logger";

import useAnalytics from "@/lib/analytics/useAnalytics";

const log = aiLogger("feature-flags");

export function useClientSideFeatureFlag(flag: string): boolean {
  const { posthogAiBetaClient: client } = useAnalytics();

  const bootstrappedFlag = window["bootstrappedFeatures"][flag] as
    | boolean
    | undefined;

  const [featureEnabled, setFeatureEnabled] = useState<boolean | undefined>();

  useEffect(() => {
    const isDebug = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true";
    if (isDebug) {
      log.info(`Feature flag ${flag} is enabled in debug mode`);
      setFeatureEnabled(true);
      return;
    }

    log.info(`Fetching feature flag ${flag}`);
    return client.onFeatureFlags(() => {
      log.info(`Setting feature flag ${flag}`);
      setFeatureEnabled(client.isFeatureEnabled(flag));
    });
  }, [client, flag, bootstrappedFlag]);

  log.info(`Flag ${flag} bootstrapped as ${bootstrappedFlag}`);
  log.info(`Flag ${flag} updated as ${featureEnabled}`);
  return featureEnabled ?? bootstrappedFlag ?? false;
}
