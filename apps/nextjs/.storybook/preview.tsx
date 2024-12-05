import React from "react";

import "@fontsource/lexend";
import "@fontsource/lexend/500.css";
import "@fontsource/lexend/600.css";
import "@fontsource/lexend/700.css";
import "@fontsource/lexend/800.css";
import "@fontsource/lexend/900.css";
import { OakThemeProvider, oakDefaultTheme } from "@oaknational/oak-components";
import type { Preview, Decorator } from "@storybook/react";
import { initialize as initializeMsw, mswLoader } from "msw-storybook-addon";

import { TooltipProvider } from "../src/components/AppComponents/Chat/ui/tooltip";
import { DialogProvider } from "../src/components/AppComponents/DialogContext";
import { AnalyticsProvider } from "../src/mocks/analytics/provider";
import { ClerkDecorator } from "../src/mocks/clerk/ClerkDecorator";
import { TRPCReactProvider } from "../src/utils/trpc";
import { RadixThemeDecorator } from "./decorators/RadixThemeDecorator";
import "./preview.css";

initializeMsw();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
};

// Providers not currently used
// - CookieConsentProvider
// - DemoProvider
// - LessonPlanTrackingProvider
// - DialogProvider
// - SidebarProvider
// - ChatModerationProvider

export const decorators: Decorator[] = [
  RadixThemeDecorator,
  ClerkDecorator,
  (Story) => (
    <>
      <TRPCReactProvider>
        <AnalyticsProvider>
          <DialogProvider>
            <OakThemeProvider theme={oakDefaultTheme}>
              <TooltipProvider>
                <Story />
              </TooltipProvider>
            </OakThemeProvider>
          </DialogProvider>
        </AnalyticsProvider>
      </TRPCReactProvider>
    </>
  ),
];

export default preview;
