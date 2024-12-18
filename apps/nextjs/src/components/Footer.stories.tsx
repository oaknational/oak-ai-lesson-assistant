import type { Meta, StoryObj } from "@storybook/react";

import Footer from "./Footer";

const meta = {
  title: "Components/Layout/Footer",
  component: Footer,
  tags: ["autodocs"],
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
