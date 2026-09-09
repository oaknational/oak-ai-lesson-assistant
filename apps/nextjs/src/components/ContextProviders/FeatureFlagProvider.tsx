"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { aiLogger } from "@oakai/logger";

import useAnalytics from "@/lib/analytics/useAnalytics";

const log = aiLogger("feature-flags");

export interface FeatureFlagContextProps {
  bootstrappedFeatures: Record<string, string | boolean>;
  bootstrappedPayloads: Record<string, unknown>;
}

const FeatureFlagContext = createContext<FeatureFlagContextProps>({
  bootstrappedFeatures: {},
  bootstrappedPayloads: {},
});

export type FeatureFlagProviderProps = Readonly<{
  children: ReactNode;
  bootstrappedFeatures: Record<string, string | boolean>;
  bootstrappedPayloads: Record<string, unknown>;
}>;

export const FeatureFlagProvider = ({
  children,
  bootstrappedFeatures,
  bootstrappedPayloads,
}: FeatureFlagProviderProps) => {
  const value = useMemo(
    () => ({ bootstrappedFeatures, bootstrappedPayloads }),
    [bootstrappedFeatures, bootstrappedPayloads],
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

/**
 * A flag's value as evaluated on the server for this render.
 *
 * Prefer this to useClientSideFeatureFlag for flags that must work for everyone: that
 * hook needs the browser's PostHog client, which never starts up for people who
 * declined cookies. Only changes on a full page reload.
 */
export const useBootstrappedFeatureFlag = (flag: string): boolean => {
  const { bootstrappedFeatures } = useContext(FeatureFlagContext);
  return bootstrappedFeatures[flag] === true;
};

/**
 * The JSON attached to a flag in PostHog, or undefined if it has none. Validate it
 * before use - anyone with PostHog access can edit it.
 */
export const useBootstrappedPayload = (flag: string): unknown => {
  const { bootstrappedPayloads } = useContext(FeatureFlagContext);
  return bootstrappedPayloads[flag];
};
