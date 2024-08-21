"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePathname, useSearchParams } from "#next/navigation";
import { useOakConsent } from "@oaknational/oak-consent-client";
import { usePostHog } from "posthog-js/react";

import { hubspotClient } from "@/lib/analytics/hubspot/HubspotClient";
import HubspotLoader from "@/lib/analytics/hubspot/HubspotLoader";
import { useAnalyticsService } from "@/lib/analytics/useAnalyticsService";
import Avo, { initAvo } from "@/lib/avo/Avo";
import getAvoBridge from "@/lib/avo/getAvoBridge";
import getAvoEnv from "@/lib/avo/getAvoEnv";
import { useClerkIdentify } from "@/lib/clerk/useClerkIdentify";
import { ServicePolicyMap } from "@/lib/cookie-consent/ServicePolicyMap";
import {
  PosthogDistinctId,
  posthogToAnalyticsService,
} from "@/lib/posthog/posthog";

type ServiceName = "posthog" | "hubspot";

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
  posthogDistinctId: PosthogDistinctId | null;
};

export type AnalyticsService<ServiceConfig> = {
  name: ServiceName;
  init: (config: ServiceConfig) => Promise<string | null>;
  state: () => "enabled" | "disabled" | "pending";
  track: EventFn;
  page: PageFn;
  identify: IdentifyFn;
  reset: ResetFn;
  optOut: () => void;
  optIn: () => void;
};

type AvoOptions = Parameters<typeof initAvo>[0];

export const analyticsContext = createContext<AnalyticsContext | null>(null);

export type AnalyticsProviderProps = {
  children?: React.ReactNode;
  avoOptions?: Partial<AvoOptions>;
};

if (
  !process.env.NEXT_PUBLIC_POSTHOG_API_KEY ||
  !process.env.NEXT_PUBLIC_POSTHOG_HOST ||
  !process.env.NEXT_PUBLIC_POSTHOG_UI_HOST
) {
  throw new Error("Missing required environment variables for PostHog.");
}
const posthogConfig = {
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
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

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  avoOptions,
}) => {
  const [posthogDistinctId, setPosthogDistinctId] =
    useState<PosthogDistinctId | null>(null);
  const [hubspotScriptLoaded, setHubspotScriptLoadedFn] = useState(false);
  const setHubspotScriptLoaded = useCallback(() => {
    setHubspotScriptLoadedFn(true);
  }, []);

  /**
   * Posthog
   */
  const posthogClient = usePostHog();
  if (!posthogClient) {
    throw new Error(
      "AnalyticsProvider should be contained within PostHogProvider",
    );
  }

  const posthogService = useRef(
    posthogToAnalyticsService(posthogClient),
  ).current;
  const posthogConsent = useOakConsent().getConsent(ServicePolicyMap.POSTHOG);
  const posthog = useAnalyticsService({
    service: posthogService,
    config: posthogConfig,
    consentState: posthogConsent,
    setPosthogDistinctId,
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
  initAvo({ env: getAvoEnv(), ...avoOptions }, {}, getAvoBridge({ posthog }));

  /**
   * Identify
   */
  const identify: IdentifyFn = useCallback(
    (userId, properties, services) => {
      const allServices = !services;
      if (allServices || services?.includes("posthog")) {
        posthog.identify(userId, properties);
      }
      if (allServices || services?.includes("hubspot")) {
        hubspot.identify(userId, properties);
      }
    },
    [posthog, hubspot],
  );

  /**
   * Reset
   */
  const reset = useCallback(() => {
    posthog.reset();
    hubspot.reset();
  }, [posthog, hubspot]);

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
   * Calls PostHog tracking directly rather than using Avos tracking plan.
   * @todo remove this once all events are migrated to Avo
   * @deprecated Use the `track` function from the analytics context instead
   */
  const trackEvent = useCallback(
    (name: EventName, properties?: EventProperties) => {
      posthog.track(name, properties);
      hubspot.track(name, properties);
    },
    [posthog, hubspot],
  );

  /**
   * Page view tracking
   */
  const page: PageFn = useCallback(
    (path) => {
      posthog.page(path);
      hubspot.page(path);
    },
    [posthog, hubspot],
  );

  /**
   * analytics
   * The analytics instance returned by useAnalytics hooks
   */
  const analytics: AnalyticsContext = useMemo(() => {
    return { track, trackEvent, identify, reset, page, posthogDistinctId };
  }, [track, trackEvent, identify, reset, page, posthogDistinctId]);

  const onClerkIdentify = useCallback(
    (user: { userId: string; email: string; isDemoUser: boolean }) => {
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
      <HubspotLoader consent={hubspotConsent} onLoad={setHubspotScriptLoaded} />
    </analyticsContext.Provider>
  );
};
