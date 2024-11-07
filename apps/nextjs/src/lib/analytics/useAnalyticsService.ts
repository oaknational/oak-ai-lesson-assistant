import { useCallback, useEffect, useRef, useState } from "react";

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
  initOnMount = false,
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
  initOnMount?: boolean;
}) => {
  const [loaded, setLoaded] = useState(scriptLoaded);
  const hasAttemptedInit = useRef(scriptLoaded);

  useEffect(() => {
    setLoaded(scriptLoaded);
  }, [scriptLoaded]);

  const attemptInit = useCallback(async () => {
    hasAttemptedInit.current = true;
    const distinctId = await service.init(config);
    if (distinctId && setPosthogDistinctId) {
      setPosthogDistinctId(distinctId);
      setLoaded(true);
    }
  }, [hasAttemptedInit, config, service, setPosthogDistinctId]);

  if (initOnMount && !hasAttemptedInit.current) {
    void attemptInit();
  }

  useEffect(() => {
    if (consentState === "granted" && !hasAttemptedInit.current) {
      void attemptInit();
    }
  }, [consentState, attemptInit]);

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
