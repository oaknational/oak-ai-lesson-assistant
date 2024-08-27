/*
Mocks the analytics provider and hooks for use in Storybook.
See the readme for why this is needed.
*/
import React from "react";

import Avo from "@/lib/avo/Avo";

import {
  type AnalyticsContext,
  analyticsContext,
} from "./../../components/ContextProviders/AnalyticsProvider";

const mockTrack: typeof Avo = new Proxy(Avo, {
  get: (target, prop) => {
    return (...args: unknown[]) => {
      console.log(`Mock Avo.${String(prop)} called with:`, target, ...args);
    };
  },
});

const mockAnalyticsContext: AnalyticsContext = {
  track: mockTrack,
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => {
    console.log("Mock trackEvent called:", eventName, properties);
  },
  identify: (userId: string, properties: { email?: string }) => {
    console.log("Mock identify called:", userId, properties);
  },
  page: (path: string) => {
    console.log("Mock page view:", path);
  },
  reset: () => {
    console.log("Mock reset called");
  },
  posthogDistinctId: "mock-distinct-id",
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <analyticsContext.Provider value={mockAnalyticsContext}>
    {children}
  </analyticsContext.Provider>
);
