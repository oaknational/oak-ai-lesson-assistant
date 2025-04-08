import type { AnalyticsService } from "@/components/ContextProviders/AnalyticsProvider";
import { ServicePolicyMap } from "@/lib/cookie-consent/ServicePolicyMap";
import { consentClient } from "@/lib/cookie-consent/consentClient";

type HubspotEvent = [string, unknown?];

declare global {
  interface Window {
    _hsq: HubspotEvent[] & { push: (event: HubspotEvent) => void };
    hubspotUserData?: {
      email?: string;
      contact_id?: string;
    };
  }
}

// Store the HubSpot contact_id so it can be used by other components
let hubspotContactId: string | null = null;
let userEmail: string | null = null;

const getQueue = (): HubspotEvent[] => {
  const _hsq = window._hsq;
  if (!_hsq) {
    throw new Error("Hubspot queue not found");
  }
  return _hsq;
};

// Manually check for HubSpot utk cookie
const getHubspotUtk = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const hsCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("hubspotutk="),
  );
  if (hsCookie) {
    return hsCookie.trim().substring(11);
  }
  return null;
};

// Try to get or retrieve HubSpot contact information
const retrieveHubspotContactInfo = (email: string) => {
  if (typeof window === "undefined") return;

  // If we already have a contact ID for this email, no need to retrieve again
  if (hubspotContactId && userEmail === email) return;

  // Store email for future reference
  userEmail = email;

  // Get the utk cookie if available
  const utk = getHubspotUtk();
  console.log("HubSpot utk:", utk);

  // Use HubSpot contacts API via _hsq to get contact information
  // This works asynchronously - HubSpot will populate window.hubspotUserData when available
  if (window._hsq) {
    window._hsq.push(["identify", { email }]);

    // Check for HubSpot's data object that may already exist
    if (window.hubspotUserData?.contact_id) {
      hubspotContactId = window.hubspotUserData.contact_id;
      console.log("Found existing HubSpot contact_id:", hubspotContactId);
    }

    // Set up a watcher to check for HubSpot data
    const checkForHubspotData = setInterval(() => {
      if (window.hubspotUserData?.contact_id) {
        hubspotContactId = window.hubspotUserData.contact_id;
        console.log("Retrieved HubSpot contact_id:", hubspotContactId);
        clearInterval(checkForHubspotData);
      }
    }, 500);

    // Only check for 10 seconds max
    setTimeout(() => clearInterval(checkForHubspotData), 10000);
  }
};

export const hubspotClient: AnalyticsService<null, "hubspot"> = {
  name: "hubspot",

  init: async () => {
    return Promise.resolve(null);
  },

  identify: (userId, properties) => {
    // If email is provided, try to get HubSpot contact info
    if (properties.email) {
      retrieveHubspotContactInfo(properties.email);
    }

    // Store the HubSpot contact_id (which is the userId in this context)
    // Only update if we don't already have one - Clerk ID is not the HubSpot ID
    if (!hubspotContactId) {
      // Log warning that we don't have a true HubSpot ID yet
      console.log(
        "Warning: Using Clerk ID as temporary HubSpot reference:",
        userId,
      );
    }

    getQueue().push(["identify", { id: userId, ...properties }]);

    // Additionally use HubSpot's tracking code to get the contact_id
    setTimeout(() => {
      if (typeof window !== "undefined" && window._hsq) {
        // Retry identify with HubSpot
        window._hsq.push(["identify", { id: userId, ...properties }]);

        // Try to explicitly get the user data if we have an email
        if (properties.email) {
          window._hsq.push(["identify", { email: properties.email }]);
        }
      }
    }, 1000);
  },

  reset: () => {
    hubspotContactId = null;
    userEmail = null;
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

// Export a function to get the stored HubSpot contact_id
export const getHubspotContactId = (): string | null => {
  // First try window.hubspotUserData which is set by HubSpot's tracking code
  if (typeof window !== "undefined" && window.hubspotUserData?.contact_id) {
    return window.hubspotUserData.contact_id;
  }

  // Fall back to our stored value
  return hubspotContactId;
};
