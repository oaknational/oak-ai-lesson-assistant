import type { Meta, StoryObj } from "@storybook/react";

import { OakP } from "@oaknational/oak-components";

import { chromaticParams } from "@/storybook/chromatic";

import ResourcesFooter from "./ResourcesFooter";

const meta = {
  title: "Components/AdditionalMaterials/ResourcesFooter",
  component: ResourcesFooter,
  tags: ["autodocs"],
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
    layout: "fullscreen",
  },
} satisfies Meta<typeof ResourcesFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <OakP>Footer content goes here</OakP>,
  },
};

export const WithMultipleElements: Story = {
  args: {
    children: (
      <>
        <OakP>Left content</OakP>
        <OakP>Right content</OakP>
      </>
    ),
  },
};