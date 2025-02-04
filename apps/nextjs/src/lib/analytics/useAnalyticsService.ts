import { useEffect, useState } from "react";

import type {
  AnalyticsService,
  ServiceName,
} from "@/components/ContextProviders/AnalyticsProvider";
import type { ConsentState } from "@/components/ContextProviders/CookieConsentProvider";

import type { MaybeDistinctId } from "../posthog/posthog";

export const useAnalyticsService = <T, S extends ServiceName>({
  service,
  config,
  consentState,
  setPosthogDistinctId,
  scriptLoaded = false,
}: {
  service: AnalyticsService<T, S>;
  config: T;
  /**
   * using consent state from props rather than service.state() because otherwise
   * we'd be reading from local-storage every render
   */
  consentState: ConsentState;
  setPosthogDistinctId?: (id: MaybeDistinctId) => void;
  scriptLoaded?: boolean;
}) => {
  const [loaded, setLoaded] = useState(scriptLoaded);
  const [hasAttemptedInit, setHasAttemptedInit] = useState(scriptLoaded);

  useEffect(() => {
    setLoaded(scriptLoaded);
  }, [scriptLoaded]);

  useEffect(() => {
    const attemptInit = async () => {
      setHasAttemptedInit(true);
      const distinctId = await service.init(config);

      if (distinctId && setPosthogDistinctId) {
        setPosthogDistinctId(distinctId);
        setLoaded(true);
      }
    };
    if (consentState === "granted" && !hasAttemptedInit) {
      void attemptInit();
    }
  }, [consentState, hasAttemptedInit, config, service, setPosthogDistinctId]);

  useEffect(() => {
    // do not track
    if (loaded) {
      if (consentState === "granted") {
        service.optIn();
      }
      if (consentState === "denied") {
        service.optOut();
        setPosthogDistinctId?.(null);
      }
    }
  }, [consentState, service, loaded, setPosthogDistinctId]);

  return service;
};
