import type { Meta, StoryObj } from "@storybook/react";

import { DemoProvider } from "@/components/ContextProviders/Demo";
import TeachingMaterialsLayout from "@/components/ResourcesLayout";
import { chromaticParams } from "@/storybook/chromatic";
import { DialogContentDecorator } from "@/storybook/decorators/DialogContentDecorator";
import { TeachingMaterialsStoreDecorator } from "@/storybook/decorators/TeachingMaterialsStoreDecorator";

import StepOne from "./StepOne";

const meta = {
  title: "Components/AdditionalMaterials/StepLayouts/StepOne",
  component: StepOne,
  decorators: [TeachingMaterialsStoreDecorator, DialogContentDecorator],
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
    layout: "fullscreen",
  },
} satisfies Meta<typeof StepOne>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    handleCreateSession: (_docType: string | null): Promise<void> => {
      return Promise.resolve();
    },
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Select teaching material"
          subTitle="Choose the downloadable resource you'd like to create with Aila for your lesson."
          step={1}
          docTypeName={null}
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};
