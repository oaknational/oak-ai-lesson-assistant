import { useEffect, useState } from "react";

import useAnalytics from "@/lib/analytics/useAnalytics";

export function useClientSideFeatureFlag(flag: string): boolean {
  const { posthogAiBetaClient: client } = useAnalytics();

  const [featureEnabled, setFeatureEnabled] = useState<boolean | undefined>();

  useEffect(() => {
    return client.onFeatureFlags(() => {
      setFeatureEnabled(client.isFeatureEnabled(flag));
    });
  }, [client, flag]);

  return featureEnabled ?? false;
}
