import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { SurveyQuestionType, SurveyType } from "posthog-js";
import type { PostHog } from "posthog-js";

import { AnalyticsDecorator } from "@/storybook/decorators/AnalyticsDecorator";
import { DialogContentDecorator } from "@/storybook/decorators/DialogContentDecorator";

import { DemoProvider } from "../ContextProviders/Demo";
import DialogContents from "./DialogContents";

const meta: Meta<typeof DialogContents> = {
  title: "Components/Dialogs/DialogContents",
  component: DialogContents,
  decorators: [DialogContentDecorator],
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
  decorators: [AnalyticsDecorator],
  parameters: {
    dialogWindow: "feedback",
    analyticsContext: {
      posthogAiBetaClient: {
        capture: () => {},
        getSurveys: (fn) => {
          fn([
            {
              id: "01917ac7-e417-0000-0c86-99ef890e6807",
              name: "End of Aila generation survey launch aug24",
              type: SurveyType.API,
              questions: [
                {
                  type: SurveyQuestionType.Rating,
                  question:
                    "How would you rate the structure and content of this lesson plan?",
                },
                {
                  type: SurveyQuestionType.Rating,
                  question:
                    "How would you rate the ease of creating this lesson with Aila?",
                },
                {
                  type: SurveyQuestionType.Open,
                  question:
                    "What suggestions do you have to improve the lesson planning experience with Aila?",
                },
              ],
            },
          ]);
        },
      } as unknown as PostHog,
    },
  },
};
