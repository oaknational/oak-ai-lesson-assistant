import { AnalyticsService } from "@/components/ContextProviders/AnalyticsProvider";
import { ServicePolicyMap } from "@/lib/cookie-consent/ServicePolicyMap";
import { consentClient } from "@/lib/cookie-consent/consentClient";

type HubspotEvent = [string, unknown?];

declare global {
  interface Window {
    _hsq: HubspotEvent[] & { push: (event: HubspotEvent) => void };
  }
}

const getQueue = (): HubspotEvent[] => {
  const _hsq = window._hsq;
  if (!_hsq) {
    throw new Error("Hubspot queue not found");
  }
  return _hsq;
};

export const hubspotClient: AnalyticsService<null, "hubspot"> = {
  name: "hubspot",

  init: async () => {
    return null;
  },

  identify: (userId, properties) => {
    getQueue().push(["identify", { id: userId, ...properties }]);
  },

  reset: () => {
    getQueue().push(["resetVisitorIdentity"]);
  },

  page: (path) => {
    const queue = getQueue();
    queue.push(["setPath", path]);
    queue.push(["trackPageView"]);
  },

  track: (name, properties) => {
    getQueue().push(["trackEvent", { ...properties, id: name }]);
  },

  optIn: () => {
    // removes __hs_do_not_track
    getQueue().push(["doNotTrack", { track: true }]);
  },

  optOut: () => {
    /**
     * @see: https://developers.hubspot.com/docs/api/events/cookie-banner#remove-cookie
     */
    // sets __hs_do_not_track
    getQueue().push(["doNotTrack"]);
  },

  state: () => {
    switch (consentClient.getConsent(ServicePolicyMap.HUBSPOT)) {
      case "denied":
        return "disabled";
      case "granted":
        return "enabled";
      default:
        return "pending";
    }
  },
};
