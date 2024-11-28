import type { Meta, StoryObj } from "@storybook/react";

import { ChatStartForm } from "./chat-start-form";

const meta: Meta<typeof ChatStartForm> = {
  title: "Components/Chat Start/ChatStartForm",
  component: ChatStartForm,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatStartForm>;

export const Default: Story = {
  args: {
    input: "",
    setInput: () => {},
    isSubmitting: false,
    submit: () => {},
  },
};

export const WithInput: Story = {
  args: {
    ...Default.args,
    input: "Mathematics, Key Stage 3, Algebra Basics",
  },
};

export const Submitting: Story = {
  args: {
    ...Default.args,
    isSubmitting: true,
  },
};
