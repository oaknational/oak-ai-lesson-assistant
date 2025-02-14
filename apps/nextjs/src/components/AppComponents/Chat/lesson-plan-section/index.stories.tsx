import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";

import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import { LessonPlanSection } from "../lesson-plan-section";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Components/LessonPlan/LessonPlanSection",
  component: LessonPlanSection,
  tags: ["autodocs"],
  args: {
    sectionKey: "learningOutcome",
    setSectionRef: fn(),
    showLessonMobile: false,
  },
  decorators: [ChatDecorator, StoreDecorator],
  parameters: {
    ...chromaticParams(["desktop"]),
    chatContext: {
      messages: [],
    },
    chatStoreState: {
      ailaStreamingStatus: "Idle",
    },
    lessonPlanStoreState: {
      id: "123",
      lessonPlan: {
        title: "About Frogs",
        keyStage: "Key Stage 2",
        subject: "Science",
        topic: "Amphibians",
        basedOn: { id: "testId", title: "Frogs in Modern Britain" },
        learningOutcome:
          "I can explain the reasons why frogs are so important to British society and culture",
      },
    },
  },
} satisfies Meta<typeof LessonPlanSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Markdown: Story = {
  parameters: {
    lessonPlanStoreState: {
      lessonPlan: {
        learningOutcome: `# Title 1
## Title 2
### Title 3
- **Bold**
- *Italic*
- Normal`,
      },
    },
  },
};

export const Streaming: Story = {
  parameters: {
    lessonPlanStoreState: {
      sectionsToEdit: ["learningOutcome"],
    },
  },
};

export const Closed: Story = {
  parameters: {
    docs: {
      story: { autoplay: true },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = await canvas.findByRole("button", { name: "toggle" });
    await sleep(10);
    await userEvent.click(toggleButton);
    await canvas.findByAltText("chevron-down");
  },
};

export const AdditionalMaterials: Story = {
  args: {
    sectionKey: "additionalMaterials",
  },
  parameters: {
    lessonPlanStoreState: {
      lessonPlan: {
        additionalMaterials: "None",
      },
    },
  },
};

export const Modify: Story = {
  parameters: {
    docs: {
      // NOTE: This should run the play function in the docs page, but seems broken
      story: { autoplay: true },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const modifyButton = await canvas.findByRole("button", { name: "Modify" });
    await userEvent.click(modifyButton);
  },
};

export const ModifyAdditionalMaterials: Story = {
  args: {
    sectionKey: "additionalMaterials",
  },
  parameters: {
    docs: {
      // NOTE: This should run the play function in the docs page, but seems broken
      story: { autoplay: true },
    },
    lessonPlanStoreState: {
      lessonPlan: {
        additionalMaterials: "None",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const modifyButton = await canvas.findByRole("button", {
      name: "Add additional materials",
    });
    await userEvent.click(modifyButton);
  },
};

export const Flag: Story = {
  parameters: {
    docs: {
      // NOTE: This should run the play function in the docs page, but seems broken
      story: { autoplay: true },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const flagButton = await canvas.findByRole("button", { name: "Flag" });
    await userEvent.click(flagButton);
  },
};
