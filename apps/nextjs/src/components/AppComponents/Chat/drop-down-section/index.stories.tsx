import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";

import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";

import DropDownSection from "./";

const MAX_INT32 = 2 ** 31 - 1;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta: Meta<typeof DropDownSection> = {
  title: "Components/LessonPlan/DropDownSection",
  component: DropDownSection,
  tags: ["autodocs"],
  args: {
    section: "learningOutcome",
    value:
      "I can explain the reasons why frogs are so important to British society and culture",
    documentContainerRef: { current: null },
    streamingTimeout: 0,
  },
  decorators: [ChatDecorator],
  parameters: {
    chatContext: {
      id: "123",
      lastModeration: null,
      messages: [],
      lessonPlan: {
        title: "About Frogs",
        keyStage: "Key Stage 2",
        subject: "Science",
        topic: "Amphibians",
        basedOn: { id: "testId", title: "Frogs in Modern Britain" },
        learningOutcome:
          "To understand the importance of frogs in British society and culture",
      },
      ailaStreamingStatus: "Idle",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropDownSection>;

export const Default: Story = {
  args: {},
};

export const Markdown: Story = {
  args: {
    value: `# Title 1
## Title 2
### Title 3
- **Bold**
- *Italic*
- Normal`,
  },
};

export const Streaming: Story = {
  args: { streamingTimeout: MAX_INT32 },
};

export const Closed: Story = {
  parameters: {
    docs: {
      // NOTE: This should run the play function in the docs page, but seems broken
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
    section: "additionalMaterials",
    value: "None",
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
  parameters: {
    docs: {
      // NOTE: This should run the play function in the docs page, but seems broken
      story: { autoplay: true },
    },
  },
  args: {
    section: "additionalMaterials",
    value: "None",
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
