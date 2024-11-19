import type { Meta, StoryObj } from "@storybook/react";
import { SurveyType } from "posthog-js";

import {
  AnalyticsContext,
  analyticsContext,
} from "@/components/ContextProviders/AnalyticsProvider";

import { DialogContext } from "../AppComponents/DialogContext";
import { DemoProvider } from "../ContextProviders/Demo";
import DialogContents from "./DialogContents";

const meta: Meta<typeof DialogContents> = {
  title: "Components/Dialogs/DialogContents",
  component: DialogContents,
  tags: ["autodocs"],
  decorators: (Story, { parameters }) => {
    return (
      <DialogContext.Provider
        value={{
          dialogWindow: parameters.dialogWindow,
          setDialogWindow: () => {},
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
  // TODO report props
  args: {},
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
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
};

// TODO: survey
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
