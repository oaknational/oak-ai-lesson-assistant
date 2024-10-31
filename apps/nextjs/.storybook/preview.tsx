import React from "react";

import "@fontsource/lexend";
import "@fontsource/lexend/500.css";
import "@fontsource/lexend/600.css";
import "@fontsource/lexend/700.css";
import "@fontsource/lexend/800.css";
import "@fontsource/lexend/900.css";
import { OakThemeProvider, oakDefaultTheme } from "@oaknational/oak-components";
import type { Preview, Decorator } from "@storybook/react";

// ModerationProvider is coming in the main Chat.tsx refactor
//import { ModerationProvider } from "../src/components/AppComponents/Chat/Chat/ModerationProvider";
import { TooltipProvider } from "../src/components/AppComponents/Chat/ui/tooltip";
import { DialogProvider } from "../src/components/AppComponents/DialogContext";
import { CookieConsentProvider } from "../src/components/ContextProviders/CookieConsentProvider";
import { DemoProvider } from "../src/components/ContextProviders/Demo";
import LessonPlanTrackingProvider from "../src/lib/analytics/lessonPlanTrackingContext";
import { SidebarProvider } from "../src/lib/hooks/use-sidebar";
import { AnalyticsProvider } from "../src/mocks/analytics/provider";
import { TRPCReactProvider } from "../src/utils/trpc";
import { MockClerkProvider } from "./MockClerkProvider";
import { ThemeDecorator } from "./ThemeDecorator";
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

export const decorators: Decorator[] = [
  ThemeDecorator,
  (Story) => (
    <MockClerkProvider>
      <CookieConsentProvider>
        {" "}
        <TRPCReactProvider>
          <DemoProvider>
            <AnalyticsProvider>
              <LessonPlanTrackingProvider chatId={"faked"}>
                <DialogProvider>
                  <OakThemeProvider theme={oakDefaultTheme}>
                    <SidebarProvider>
                      <TooltipProvider>
                        {/* <ModerationProvider initialModerations={[]}> */}
                        <Story />
                        {/* </ModerationProvider> */}
                      </TooltipProvider>
                    </SidebarProvider>
                  </OakThemeProvider>
                </DialogProvider>
              </LessonPlanTrackingProvider>
            </AnalyticsProvider>
          </DemoProvider>{" "}
        </TRPCReactProvider>
      </CookieConsentProvider>
    </MockClerkProvider>
  ),
];

export default preview;
