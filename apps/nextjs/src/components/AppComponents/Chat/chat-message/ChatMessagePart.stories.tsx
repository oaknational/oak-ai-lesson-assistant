import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { Meta, StoryObj } from "@storybook/react";

import { ChatMessagePart } from "./ChatMessagePart";

const meta: Meta<typeof ChatMessagePart> = {
  title: "Components/Chat/ChatMessagePart",
  component: ChatMessagePart,
  tags: ["autodocs"],
  args: {
    inspect: false,
  },
};

export default meta;
type Story = StoryObj<typeof ChatMessagePart>;

const basePart: Omit<MessagePart, "document"> = {
  type: "message-part",
  id: "test-part-id",
  isPartial: false,
};

export const PromptMessagePart: Story = {
  args: {
    part: {
      ...basePart,
      document: {
        type: "prompt",
        message:
          "Are the learning outcome and learning cycles appropriate for your pupils? If not, suggest an edit. Otherwise, tap **Continue** to move on to the next step.",
      },
    },
  },
};

export const ErrorMessagePart: Story = {
  args: {
    part: {
      ...basePart,
      document: {
        type: "error",
        message:
          "**Unfortunately you’ve exceeded your fair usage limit for today.** Please come back in 11 hours. If you require a higher limit, please [make a request](https://forms.gle/tHsYMZJR367zydsG8).",
      },
    },
  },
};

export const TextMessagePart: Story = {
  args: {
    part: {
      ...basePart,
      document: {
        type: "text",
        value:
          "Are the learning outcome and learning cycles appropriate for your pupils? If not, suggest an edit. Otherwise, tap **Continue** to move on to the next step.",
      },
    },
  },
};

export const WithInspector: Story = {
  args: {
    inspect: true,
    part: {
      ...basePart,
      document: {
        type: "prompt",
        message: "This is a prompt",
      },
    },
  },
};
