import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";

import type { AnalyticsContext } from "@/components/ContextProviders/AnalyticsProvider";
import { analyticsContext } from "@/components/ContextProviders/AnalyticsProvider";

import { DialogContext } from "../AppComponents/DialogContext";
import { DemoProvider } from "../ContextProviders/Demo";
import DialogContents from "./DialogContents";

const meta: Meta<typeof DialogContents> = {
  title: "Components/Dialogs/DialogContents",
  component: DialogContents,
  decorators: (Story, { parameters }) => {
    return (
      <DialogContext.Provider
        value={{
          dialogWindow: parameters.dialogWindow,
          setDialogWindow: () => {},
          dialogProps: {},
          setDialogProps: () => {},
          openSidebar: false,
          setOpenSidebar: () => {},
        }}
      >
        <Story />
      </DialogContext.Provider>
    );
  },
};

export default meta;
type Story = StoryObj<typeof DialogContents>;

export const ShareChat: Story = {
  args: {
    lesson: {},
    chatId: "example-chat-id",
    isShared: false,
  },
  parameters: {
    dialogWindow: "share-chat",
  },
};

export const ReportContent: Story = {
  args: {},
  parameters: {
    dialogWindow: "report-content",
  },
};

export const DemoShareLocked: Story = {
  args: {},
  parameters: {
    dialogWindow: "demo-share-locked",
    auth: "signedInDemo",
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
};

export const DemoInterstitial: Story = {
  args: {},
  parameters: {
    dialogWindow: "demo-interstitial",
    auth: "signedInDemo",
    msw: {
      handlers: [
        http.get("/api/trpc/chat/chat.appSessions.remainingLimit", () => {
          return HttpResponse.json({
            result: { data: { json: { remaining: 3 } } },
          });
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
};

export const DemoInterstitialLimited: Story = {
  args: {},
  parameters: {
    dialogWindow: "demo-interstitial",
    auth: "signedInDemo",
    msw: {
      handlers: [
        http.get("/api/trpc/chat/chat.appSessions.remainingLimit", () => {
          return HttpResponse.json({
            result: { data: { json: { remaining: 0 } } },
          });
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
};

export const Feedback: Story = {
  args: {},
  parameters: {
    dialogWindow: "feedback",
  },
  decorators: (Story) => {
    return (
      <analyticsContext.Provider
        value={
          {
            track: () => {},
            trackEvent: () => {},
            identify: () => {},
            reset: () => {},
            page: () => {},
            posthogAiBetaClient: {
              capture: () => {},
              getSurveys: (fn) => {
                fn([
                  {
                    id: "01917ac7-e417-0000-0c86-99ef890e6807",
                    name: "End of Aila generation survey launch aug24",
                    type: "api",
                    questions: [
                      {
                        type: "rating",
                        question:
                          "How would you rate the structure and content of this lesson plan?",
                      },
                      {
                        type: "rating",
                        question:
                          "How would you rate the ease of creating this lesson with Aila?",
                      },
                      {
                        type: "open",
                        question:
                          "What suggestions do you have to improve the lesson planning experience with Aila?",
                      },
                    ],
                  },
                ]);
              },
            },
          } as unknown as AnalyticsContext
        }
      >
        <Story />
      </analyticsContext.Provider>
    );
  },
};
