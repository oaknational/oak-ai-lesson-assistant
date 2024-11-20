"use client";

import type { ReactNode } from "react";
import {
  useMemo,
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import { aiLogger } from "@oakai/logger";

import useAnalytics from "@/lib/analytics/useAnalytics";

const log = aiLogger("feature-flags");

export interface FeatureFlagContextProps {
  bootstrappedFeatures: Record<string, string | boolean>;
}

const FeatureFlagContext = createContext<FeatureFlagContextProps>({
  bootstrappedFeatures: {},
});

export interface FeatureFlagProviderProps {
  children: ReactNode;
  bootstrappedFeatures: Record<string, string | boolean>;
}

export const FeatureFlagProvider = ({
  children,
  bootstrappedFeatures,
}: FeatureFlagProviderProps) => {
  const value = useMemo(
    () => ({ bootstrappedFeatures }),
    [bootstrappedFeatures],
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useClientSideFeatureFlag = (flag: string) => {
  const context = useContext(FeatureFlagContext);

  const { posthogAiBetaClient: posthog } = useAnalytics();
  const hasLogged = useRef(false);

  const [posthogFeatureFlag, setPosthogFeatureFlag] = useState<
    boolean | string | undefined
  >();

  const bootstrappedFlag = context.bootstrappedFeatures[flag];

  useEffect(() => {
    return posthog.onFeatureFlags(() => {
      const updatedValue = posthog.isFeatureEnabled(flag);
      if (updatedValue !== bootstrappedFlag) {
        log.info(`Updating ${flag} to ${updatedValue}`);
        setPosthogFeatureFlag(updatedValue);
      }
    });
  }, [posthog, flag, bootstrappedFlag]);

  const isDebug = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true";
  if (isDebug) {
    if (!hasLogged.current) {
      hasLogged.current = true;
      log.info(`Feature flag ${flag} is enabled in debug mode`);
    }
    return true;
  }

  // NOTE: This will flash from the bootstrapped value to the posthog value
  //       only on page load within 1 minute of toggling a flag
  return posthogFeatureFlag ?? bootstrappedFlag ?? false;
};
