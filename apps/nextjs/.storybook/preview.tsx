import React from "react";

import "@fontsource/lexend";
import "@fontsource/lexend/500.css";
import "@fontsource/lexend/600.css";
import "@fontsource/lexend/700.css";
import "@fontsource/lexend/800.css";
import "@fontsource/lexend/900.css";
import { OakThemeProvider, oakDefaultTheme } from "@oaknational/oak-components";
import type { Decorator, Preview } from "@storybook/react";
import {
  MswParameters,
  initialize as initializeMsw,
  mswLoader,
} from "msw-storybook-addon";

import { TooltipProvider } from "../src/components/AppComponents/Chat/ui/tooltip";
import { DialogProvider } from "../src/components/AppComponents/DialogContext";
import { AnalyticsProvider } from "../src/mocks/analytics/provider";
import { ClerkDecorator } from "../src/mocks/clerk/ClerkDecorator";
import { TRPCReactProvider } from "../src/utils/trpc";
import { ChromaticValidationDecorator } from "./decorators/ChromaticValidationDecorator";
import { MathJaxDecorator } from "./decorators/MathJaxDecorator";
import { RadixThemeDecorator } from "./decorators/RadixThemeDecorator";
import "./preview.css";

declare module "@storybook/csf" {
  interface Parameters {
    msw?: MswParameters["msw"];
  }
}

initializeMsw();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: { width: "375px", height: "800px" },
        },
        mobileWide: {
          name: "Mobile Wide",
          styles: { width: "430px", height: "930px" },
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1200px", height: "1000px" },
        },
        desktopWide: {
          name: "Desktop Wide",
          styles: { width: "1400px", height: "1000px" },
        },
      },
    },
  },
  loaders: [mswLoader],
};

// NOTE: See ./decorators for more decorators available to use in stories

export const decorators: Decorator[] = [
  RadixThemeDecorator,
  MathJaxDecorator,
  ClerkDecorator,
  ChromaticValidationDecorator,
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
