import type { Meta, StoryObj } from "@storybook/react";
import { promise } from "zod";

import { DemoProvider } from "@/components/ContextProviders/Demo";
import TeachingMaterialsLayout from "@/components/ResourcesLayout";
import { chromaticParams } from "@/storybook/chromatic";
import { DialogContentDecorator } from "@/storybook/decorators/DialogContentDecorator";
import { TeachingMaterialsStoreDecorator } from "@/storybook/decorators/TeachingMaterialsStoreDecorator";

import StepThree from "./StepThree";

const meta = {
  title: "Components/TeachingMaterials/StepLayouts/StepThree",
  component: StepThree,
  decorators: [TeachingMaterialsStoreDecorator, DialogContentDecorator],
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
    layout: "fullscreen",
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
          keyLearningPoints: [
            "Understanding the concept of fractions",
            "Identifying fractions in everyday contexts",
            "Comparing and ordering fractions",
          ],
        },
      },
      docType: "additional-starter-quiz",
    },
  },
} satisfies Meta<typeof StepThree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    handleSubmit: () => {
      return {} as Promise<void>;
    },
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Introduction to Fractions"
          subTitle="Year 4 • Mathematics"
          step={3}
          docTypeName={null}
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};
