import React from "react";

import "@fontsource/lexend";
import "@fontsource/lexend/500.css";
import "@fontsource/lexend/600.css";
import "@fontsource/lexend/700.css";
import "@fontsource/lexend/800.css";
import "@fontsource/lexend/900.css";
import { OakThemeProvider, oakDefaultTheme } from "@oaknational/oak-components";
import type { Preview, Decorator } from "@storybook/react";

import { TooltipProvider } from "../src/components/AppComponents/Chat/ui/tooltip";
import { AnalyticsProvider } from "../src/mocks/analytics/provider";
import { ClerkDecorator } from "../src/mocks/clerk/ClerkDecorator";
import { TRPCReactProvider } from "../src/utils/trpc";
import { RadixThemeDecorator } from "./decorators/RadixThemeDecorator";
import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ["autodocs"],
};

// Providers not currently used
// - CookieConsentProvider
// - DemoProvider
// - LessonPlanTrackingProvider
// - DialogProvider
// - OakThemeProvider
// - SidebarProvider
// - ChatModerationProvider

export const decorators: Decorator[] = [
  RadixThemeDecorator,
  ClerkDecorator,
  (Story) => (
    <>
      {/* TODO: Mock tRPC calls with MSW */}
      <TRPCReactProvider>
        <AnalyticsProvider>
          <TooltipProvider>
            <Story />
          </TooltipProvider>
        </AnalyticsProvider>
      </TRPCReactProvider>
    </>
  ),
];

export default preview;
