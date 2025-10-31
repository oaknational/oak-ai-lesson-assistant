import { OakFlex } from "@oaknational/oak-components";
import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import StepLoadingScreen from "./StepLoadingScreen";

const meta = {
  title: "Components/TeachingMaterials/StepLoadingScreen",
  component: StepLoadingScreen,
  tags: ["autodocs"],
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <OakFlex $height={"100vh"}>
        <Story />
      </OakFlex>
    ),
  ],
} satisfies Meta<typeof StepLoadingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TeachingMaterial: Story = {
  args: {
    docTypeName: "Glossary",
    source: "teachingMaterial",
  },
};

export const TeachingMaterialWithoutDocType: Story = {
  args: {
    docTypeName: null,
    source: "teachingMaterial",
  },
};

export const LessonPlan: Story = {
  args: {
    docTypeName: "Quiz",
    source: "lessonPlan",
  },
};

export const LessonPlanWithoutDocType: Story = {
  args: {
    docTypeName: null,
    source: "lessonPlan",
  },
};
