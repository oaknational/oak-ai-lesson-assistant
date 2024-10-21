import { useEffect, useState } from "react";

import { aiLogger } from "@oakai/logger";

import useAnalytics from "@/lib/analytics/useAnalytics";

const log = aiLogger("feature-flags");

export function useClientSideFeatureFlag(flag: string): boolean {
  const { posthogAiBetaClient: client } = useAnalytics();

  const [featureEnabled, setFeatureEnabled] = useState<boolean | undefined>();

  useEffect(() => {
    const isDebug = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true";

    if (isDebug) {
      log.info(`Feature flag ${flag} is enabled in debug mode`);
      setFeatureEnabled(true);
    } else {
      return client.onFeatureFlags(() => {
        setFeatureEnabled(client.isFeatureEnabled(flag));
      });
    }
  }, [client, flag]);

  return featureEnabled ?? false;
}
