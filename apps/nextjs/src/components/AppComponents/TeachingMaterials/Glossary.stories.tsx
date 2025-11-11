import type { GlossarySchema } from "@oakai/teaching-materials/src/documents/teachingMaterials/glossary/schema";

import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { Glossary } from "./Glossary";

const glossaryFixture: GlossarySchema = {
  lessonTitle: "Photosynthesis",
  glossary: [
    {
      term: "Photosynthesis",
      definition:
        "the process by which green plants make their own food using sunlight",
    },
    {
      term: "Chlorophyll",
      definition: "a green pigment responsible for the absorption of light",
    },
    { term: "Stomata", definition: "tiny openings on leaves for gas exchange" },
  ],
};

const meta: Meta<typeof Glossary> = {
  title: "Components/TeachingMaterials/Glossary",
  component: Glossary,
  parameters: {
    // Including custom decorators changes the layout from fullscreen
    layout: "fullscreen",
    ...chromaticParams(["mobile", "desktop"]),
  },
};
export default meta;

type Story = StoryObj<typeof Glossary>;

export const Default: Story = {
  args: {
    action: "view",
    generation: glossaryFixture,
  },
};
