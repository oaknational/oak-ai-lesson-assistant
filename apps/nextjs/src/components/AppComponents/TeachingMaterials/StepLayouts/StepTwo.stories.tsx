import type { Meta, StoryObj } from "@storybook/react";

import { DemoProvider } from "@/components/ContextProviders/Demo";
import TeachingMaterialsLayout from "@/components/ResourcesLayout";
import { chromaticParams } from "@/storybook/chromatic";
import { DialogContentDecorator } from "@/storybook/decorators/DialogContentDecorator";
import { TeachingMaterialsStoreDecorator } from "@/storybook/decorators/TeachingMaterialsStoreDecorator";

import StepTwo from "./StepTwo";

const meta = {
  title: "Components/TeachingMaterials/StepLayouts/StepTwo",
  component: StepTwo,
  decorators: [TeachingMaterialsStoreDecorator, DialogContentDecorator],
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
    layout: "fullscreen",
  },
} satisfies Meta<typeof StepTwo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    handleSubmitLessonPlan: async (params) => {
      console.log("Submitting lesson plan:", params);
    },
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="What are you teaching?"
          subTitle="The more detail you give, the better suited your resource will be for your lesson."
          step={2}
          docTypeName={null}
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};
