import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";
import { DialogContentDecorator } from "@/storybook/decorators/DialogContentDecorator";

import { ModerationMessage } from "./TeachingMaterialMessage";

const meta = {
  title: "Components/TeachingMaterials/TeachingMaterialMessage",
  component: ModerationMessage,
  decorators: [DialogContentDecorator],
  parameters: {
    ...chromaticParams(["desktop"]),
    layout: "centered",
  },
} satisfies Meta<typeof ModerationMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    moderation: {
      scores: {
        l: 5,
        v: 5,
        u: 5,
        s: 5,
        p: 5,
        t: 5,
      },
      categories: [],
      justification:
        "The additional material resource titled 'Exploring animal habitats' is fully compliant across all categories. The content is educational and focuses on defining terms related to animal habitats, such as adaptation, environment, habitat, temperature, and vegetation. There is no use of discriminatory language, offensive language, or strong language. There is no depiction or discussion of violence, conflict, or sensitive topics. The content does not include any nudity or sexual content. There is no involvement of physical activities, exploration of objects, or use of equipment requiring supervision. Additionally, there are no guides or encouragements of harmful or illegal activities. The material is appropriate for the intended audience and does not require any content warnings or adult supervision.",
    },
  },
};
