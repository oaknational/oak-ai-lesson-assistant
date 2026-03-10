import type { DisplayCategory } from "@oakai/core/src/utils/ailaModeration/helpers";

import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";

import { ContentGuidanceModalContent } from "./content-guidance-modal";

const meta = {
  title: "Components/Chat/ContentGuidanceModal",
  component: ContentGuidanceModalContent,
  tags: ["autodocs"],
  args: {
    onClose: () => {},
  },
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof ContentGuidanceModalContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentGuidanceCategory: DisplayCategory = {
  code: "l/discriminatory-language",
  shortDescription: "Discriminatory behaviour or language",
  longDescription:
    "This lesson contains depiction or discussion of discriminatory behaviour or language (including stereotypes or slurs). Some pupils may find this upsetting. Please check this content carefully.",
  severityLevel: "content-guidance",
};

const enhancedScrutinyCategory: DisplayCategory = {
  code: "r/recent-content",
  shortDescription: "Recent content",
  longDescription:
    "This lesson references recent events. Please double-check key facts and ensure the information is current and accurate.",
  severityLevel: "enhanced-scrutiny",
};

const heightenedCautionCategory: DisplayCategory = {
  code: "e/rshe-content",
  shortDescription: "RSHE content",
  longDescription:
    "This lesson contains RSHE content. Please review it against your school's RSHE policy and ensure the approach is appropriate for your context and pupils.",
  severityLevel: "heightened-caution",
};

const violenceCategory: DisplayCategory = {
  code: "u/violence-or-suffering",
  shortDescription: "Violence or suffering",
  longDescription:
    "This lesson contains violence or suffering (e.g., war, famine, disasters, or animal cruelty). Some pupils may find this distressing. Please check this content carefully.",
  severityLevel: "content-guidance",
};

export const ContentGuidance: Story = {
  args: { categories: [contentGuidanceCategory] },
};

export const EnhancedScrutiny: Story = {
  args: { categories: [enhancedScrutinyCategory] },
};

export const HeightenedCaution: Story = {
  args: { categories: [heightenedCautionCategory] },
};

export const MultipleCategories: Story = {
  args: {
    categories: [contentGuidanceCategory, violenceCategory],
  },
};
