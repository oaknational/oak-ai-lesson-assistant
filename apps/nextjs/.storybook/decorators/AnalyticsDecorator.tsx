import React from "react";

import type { Decorator } from "@storybook/nextjs";
import { fn } from "storybook/test";

import {
  type AnalyticsContext,
  analyticsContext,
} from "../../src/components/ContextProviders/AnalyticsProvider";

declare module "@storybook/nextjs" {
  interface Parameters {
    analyticsContext?: Partial<AnalyticsContext>;
  }
}

export const AnalyticsDecorator: Decorator = (Story, { parameters }) => {
  return (
    <analyticsContext.Provider
      value={
        {
          track: fn(),
          trackEvent: fn(),
          identify: fn(),
          reset: fn(),
          page: fn(),
          posthogAiBetaClient: {},
          ...parameters.analyticsContext,
        } as unknown as AnalyticsContext
      }
    >
      <Story />
    </analyticsContext.Provider>
  );
};
