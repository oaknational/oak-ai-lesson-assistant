"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useOakConsent } from "@oaknational/oak-consent-client";
import { usePathname, useSearchParams } from "next/navigation";
import { PostHog } from "posthog-js";

import { hubspotClient } from "@/lib/analytics/hubspot/HubspotClient";
import HubspotLoader from "@/lib/analytics/hubspot/HubspotLoader";
import { useAnalyticsService } from "@/lib/analytics/useAnalyticsService";
import Avo, { initAvo } from "@/lib/avo/Avo";
import getAvoBridge from "@/lib/avo/getAvoBridge";
import getAvoEnv from "@/lib/avo/getAvoEnv";
import { useClerkIdentify } from "@/lib/clerk/useClerkIdentify";
import { ServicePolicyMap } from "@/lib/cookie-consent/ServicePolicyMap";
import { posthogToAnalyticsService } from "@/lib/posthog/posthog";

export type ServiceName = "posthog" | "hubspot";

export type EventName = string;
export type EventProperties = Record<string, unknown>;
export type EventFn = (
  eventName: EventName,
  properties?: EventProperties,
) => void;
export type PageFn = (path: string) => void;
export type IdentifyProperties = { email?: string; isDemoUser?: boolean };
export type IdentifyFn = (
  userId: string,
  properties: IdentifyProperties,
  services?: ServiceName[],
) => void;
export type ResetFn = () => void;

export type TrackFns = Omit<
  typeof Avo,
  "initAvo" | "AvoEnv" | "avoInspectorApiKey"
>;

export type AnalyticsContext = {
  track: TrackFns;
  // @deprecated Use the `track` function from the analytics context instead
  trackEvent: EventFn; // for legacy events
  identify: IdentifyFn;
  page: PageFn;
  reset: ResetFn;
  posthogAiBetaClient: PostHog;
};

export type AnalyticsService<ServiceConfig, SN extends ServiceName> = {
  name: SN;
  init: (config: ServiceConfig) => Promise<string | null>;
  state: () => "enabled" | "disabled" | "pending";
  track: EventFn;
  page: PageFn;
  identify: IdentifyFn;
  reset: ResetFn;
  optOut: () => void;
  optIn: () => void;
} & (SN extends "posthog" ? { client: PostHog } : object);

type AvoOptions = Parameters<typeof initAvo>[0];

export const analyticsContext = createContext<AnalyticsContext | null>(null);

export type AnalyticsProviderProps = {
  children?: React.ReactNode;
  avoOptions?: Partial<AvoOptions>;
  bootstrappedFeatures: Record<string, string | boolean>;
};

if (
  // Main Oak posthog key
  !process.env.NEXT_PUBLIC_POSTHOG_OAK_API_KEY ||
  // Ai-beta posthog key
  !process.env.NEXT_PUBLIC_POSTHOG_API_KEY ||
  // Posthog shared config
  !process.env.NEXT_PUBLIC_POSTHOG_HOST ||
  !process.env.NEXT_PUBLIC_POSTHOG_UI_HOST
) {
  throw new Error(
    "Missing required environment variables for PostHog instances",
  );
}
const posthogAiBetaConfig = {
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
  apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  uiHost: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST,
};

const posthogOakConfig = {
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_OAK_API_KEY,
  apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  uiHost: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST,
};

const useNavigationTracking = (onNavigationChange: PageFn) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const path = useMemo(() => {
    const searchParamsStr =
      searchParams?.size > 0 ? `?${searchParams.toString()}` : "";
    return `${pathname}${searchParamsStr}`;
  }, [pathname, searchParams]);

  // Ignore initial page load, including Strict Mode's double-render
  const initialIgnorePath = useRef<string | null>(path);

  useEffect(() => {
    if (path === initialIgnorePath.current) {
      return;
    } else {
      initialIgnorePath.current = path;
    }

    onNavigationChange(path);
  }, [path, onNavigationChange]);
};

const posthogClientOak = new PostHog();
const posthogClientAiBeta = new PostHog();

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  avoOptions,
  bootstrappedFeatures,
}) => {
  const [hubspotScriptLoaded, setHubspotScriptLoaded] = useState(false);
  const setHubspotScriptLoadedOnce = useCallback(() => {
    setHubspotScriptLoaded(true);
  }, []);

  /**
   * Posthog - main AI beta instance
   */
  const posthogServiceOak = useRef(
    posthogToAnalyticsService(posthogClientOak),
  ).current;
  const posthogConsentOak = useOakConsent().getConsent(
    ServicePolicyMap.POSTHOG,
  );
  const posthogOak = useAnalyticsService({
    service: posthogServiceOak,
    config: posthogOakConfig,
    consentState: posthogConsentOak,
  });

  /**
   * Posthog - main Oak instance
   */
  const posthogServiceAiBeta = useRef(
    posthogToAnalyticsService(posthogClientAiBeta),
  ).current;
  const posthogConsentAiBeta = useOakConsent().getConsent(
    ServicePolicyMap.POSTHOG,
  );
  const posthogAiBeta = useAnalyticsService({
    service: posthogServiceAiBeta,
    config: { ...posthogAiBetaConfig, bootstrappedFeatures },
    consentState: posthogConsentAiBeta,
    initOnMount: true,
  });

  /**
   * Hubspot
   */
  const hubspotConsent = useOakConsent().getConsent(ServicePolicyMap.HUBSPOT);
  const hubspot = useAnalyticsService({
    service: hubspotClient,
    config: null,
    consentState: hubspotConsent,
    scriptLoaded: hubspotScriptLoaded,
  });

  /**
   * Avo
   */
  initAvo(
    { env: getAvoEnv(), ...avoOptions },
    {},
    getAvoBridge({ posthog: posthogOak }),
    getAvoBridge({ posthog: posthogAiBeta }),
  );

  /**
   * Identify
   */
  const identify: IdentifyFn = useCallback(
    (userId, properties, services) => {
      const allServices = !services;
      if (allServices || services?.includes("posthog")) {
        posthogAiBeta.identify(userId, properties);
        const { ...nonPiiProperties } = properties;
        delete nonPiiProperties.email;
        posthogOak.identify(userId, nonPiiProperties);
      }
      if (allServices || services?.includes("hubspot")) {
        hubspot.identify(userId, properties);
      }
    },
    [posthogOak, posthogAiBeta, hubspot],
  );

  /**
   * Reset
   */
  const reset = useCallback(() => {
    posthogOak.reset();
    posthogAiBeta.reset();
    hubspot.reset();
  }, [posthogOak, posthogAiBeta, hubspot]);

  /**
   * Event tracking
   * Object containing Track functions as defined in the Avo tracking plan.
   * Track functions are then called for individual services as found in
   * getAvoBridge.
   */
  const track = useMemo(() => {
    return Avo;
  }, []);

  /**
   * Legacy event tracking
   * Calls PostHog tracking directly rather than using Avo's tracking plan.
   * @todo remove this once all events are migrated to Avo
   * @deprecated Use the `track` function from the analytics context instead
   */
  const trackEvent = useCallback(
    (name: EventName, properties?: EventProperties) => {
      // **Note: we are not sending legacy events to the Oak PostHog instance**
      posthogAiBeta.track(name, properties);
      hubspot.track(name, properties);
    },
    [posthogAiBeta, hubspot],
  );

  /**
   * Page view tracking
   */
  const page: PageFn = useCallback(
    (path) => {
      posthogOak.page(path);
      posthogAiBeta.page(path);
      hubspot.page(path);
    },
    [posthogOak, posthogAiBeta, hubspot],
  );

  /**
   * analytics
   * The analytics instance returned by useAnalytics hooks
   */
  const analytics: AnalyticsContext = useMemo(() => {
    return {
      track,
      trackEvent,
      identify,
      reset,
      page,
      posthogAiBetaClient: posthogAiBeta.client,
    };
  }, [track, trackEvent, identify, reset, page, posthogAiBeta.client]);

  const onClerkIdentify = useCallback(
    (user: { userId: string; email: string; isDemoUser?: boolean }) => {
      identify(user.userId, { email: user.email, isDemoUser: user.isDemoUser });
    },
    [identify],
  );

  useClerkIdentify({
    onIdentify: onClerkIdentify,
    onLogout: reset,
  });
  useNavigationTracking(page);

  return (
    <analyticsContext.Provider value={analytics}>
      {children}
      <HubspotLoader
        consent={hubspotConsent}
        onLoad={setHubspotScriptLoadedOnce}
      />
    </analyticsContext.Provider>
  );
};
