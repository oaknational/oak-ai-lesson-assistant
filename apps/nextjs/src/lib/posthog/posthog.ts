import type { PostHog } from "posthog-js";

import type { AnalyticsService } from "@/components/ContextProviders/AnalyticsProvider";

import { ServicePolicyMap } from "../cookie-consent/ServicePolicyMap";
import { consentClient } from "../cookie-consent/consentClient";

export type PosthogDistinctId = string;
export type MaybeDistinctId = string | null;

export type PosthogConfig = {
  apiKey: string;
  apiHost: string;
  uiHost: string;
};

export const posthogToAnalyticsService = (
  client: PostHog,
): AnalyticsService<PosthogConfig, "posthog"> => ({
  name: "posthog",
  init: ({ apiKey, apiHost, uiHost }) =>
    new Promise((resolve) => {
      client.init(apiKey, {
        api_host: apiHost,
        ui_host: uiHost,
        persistence: "localStorage+cookie",
        loaded: (posthog) => {
          // Enable debug mode in development
          if (process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true") {
            posthog.debug();
          }
          if (consentClient.getConsent(ServicePolicyMap.POSTHOG) === "denied") {
            posthog.opt_out_capturing();
            posthog.set_config({ persistence: "memory" });
          }
          resolve(client.get_distinct_id());
        },
        autocapture: true,
      });
    }),
  identify: (userId, properties) => {
    client.identify(userId, properties);
  },
  reset: () => {
    client.reset();
  },
  page: (path) => {
    client.capture("$pageview", {
      $current_url: `${window.origin}${path}`,
    });
  },
  track: (name, properties) => {
    client.capture(name, properties);
  },
  optIn: () => {
    if (client.has_opted_out_capturing()) {
      client.opt_in_capturing();
      client.set_config({ persistence: "localStorage+cookie" });
    }
  },
  optOut: () => {
    if (client.has_opted_in_capturing()) {
      client.opt_out_capturing();
      client.set_config({ persistence: "memory" });
    }
  },
  state: () => {
    switch (consentClient.getConsent(ServicePolicyMap.POSTHOG)) {
      case "denied":
        return "disabled";
      case "granted":
        return "enabled";
      default:
        return "pending";
    }
  },
  client,
});
