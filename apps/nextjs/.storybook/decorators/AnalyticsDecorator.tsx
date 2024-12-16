import React from "react";

import type { Decorator } from "@storybook/react";
import { fn } from "@storybook/test";

import {
  analyticsContext,
  type AnalyticsContext,
} from "../../src/components/ContextProviders/AnalyticsProvider";

declare module "@storybook/csf" {
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
