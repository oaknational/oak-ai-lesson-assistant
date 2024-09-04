import { useEffect, useState } from "react";

import { useUser } from "@clerk/nextjs";

import useAnalytics from "@/lib/analytics/useAnalytics";

import { checkFeatureFlag } from "./checkFeatureFlag";

let isUserIdentified = false;
export function useClientSideFeatureFlag(
  featureFlagId: string,
): [boolean, boolean] {
  const { user, isLoaded } = useUser();

  const { posthogAiBetaClient } = useAnalytics();

  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isCheckComplete, setIsCheckComplete] = useState<boolean>(false);

  useEffect(() => {
    function checkFeatureFlagStatus() {
      if (process.env.NEXT_PUBLIC_ENVIRONMENT !== "prd") {
        setIsEnabled(true);
        setIsCheckComplete(true);
        return;
      }

      if (isLoaded && user) {
        if (!isUserIdentified) {
          const distinctId = posthogAiBetaClient.get_distinct_id();

          if (distinctId !== user.id) {
            posthogAiBetaClient.identify(user.id, {
              email: user.primaryEmailAddress?.emailAddress,
            });
          }
          isUserIdentified = true;
        }
        const isFeatureFlagEnabled = checkFeatureFlag(
          posthogAiBetaClient,
          featureFlagId,
        );

        setIsEnabled(isFeatureFlagEnabled);
        setIsCheckComplete(true);
      } else if (isLoaded && !user) {
        console.log("User is not signed in");
        setIsEnabled(false);
        setIsCheckComplete(true);
      }
    }

    checkFeatureFlagStatus();
  }, [user, isLoaded, featureFlagId, posthogAiBetaClient]);

  return [isEnabled, isCheckComplete];
}
