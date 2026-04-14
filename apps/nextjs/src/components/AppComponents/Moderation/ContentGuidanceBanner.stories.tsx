import { getDisplayCategories } from "@oakai/core/src/utils/ailaModeration/severityLevel";

import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";

import { ContentGuidanceBanner } from "./ContentGuidanceBanner";

const categoriesFor = (...codes: string[]) =>
  getDisplayCategories({ categories: codes });

const meta = {
  title: "Components/Moderation/ContentGuidanceBanner",
  component: ContentGuidanceBanner,
  tags: ["autodocs"],
  args: {
    categories: categoriesFor("l/discriminatory-language"),
  },
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof ContentGuidanceBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContentGuidance: Story = {};

export const EnhancedScrutiny: Story = {
  args: {
    categories: categoriesFor("r/recent-content"),
  },
};

export const HeightenedCaution: Story = {
  args: {
    categories: categoriesFor("e/rshe-content"),
  },
};

export const MultipleCategories: Story = {
  args: {
    categories: categoriesFor(
      "l/discriminatory-language",
      "u/violence-or-suffering",
    ),
  },
};
