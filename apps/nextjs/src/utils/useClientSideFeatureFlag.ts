import { useEffect, useState } from "react";

import useAnalytics from "@/lib/analytics/useAnalytics";

export function useClientSideFeatureFlag(flag: string): boolean {
  const { posthogAiBetaClient: client } = useAnalytics();

  const [featureEnabled, setFeatureEnabled] = useState<boolean | undefined>();

  useEffect(() => {
    const isDebug = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true";

    return client.onFeatureFlags(() => {
      const isEnabled = isDebug ? true : client.isFeatureEnabled(flag);
      setFeatureEnabled(isEnabled);
    });
  }, [client, flag]);

  return featureEnabled ?? false;
}
