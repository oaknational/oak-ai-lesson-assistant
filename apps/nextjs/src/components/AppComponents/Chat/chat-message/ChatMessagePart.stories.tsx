import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";

import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";
import { MathJaxDecorator } from "@/storybook/decorators/MathJaxDecorator";

import { ChatMessagePart } from "./ChatMessagePart";

const meta = {
  title: "Components/Chat/ChatMessagePart",
  component: ChatMessagePart,
  tags: ["autodocs"],
  decorators: [MathJaxDecorator],
  args: {
    inspect: false,
  },
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof ChatMessagePart>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const TextMessagePartWithMaths: Story = {
  args: {
    part: {
      ...basePart,
      document: {
        type: "text",
        value: "The new value is \\(x = 6\\), so the area is $$36cm^2$$.",
      },
    },
  },
};

export const TextMessagePartWithComplexMathsMarkdown: Story = {
  args: {
    part: {
      ...basePart,
      document: {
        type: "text",
        value: [
          "Here is a worked example with mixed markdown and maths.",
          "",
          "- Start with \\(x_i + \\frac{1}{2}x^2 = 40\\).",
          "- Rearrange to find \\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]",
          "- The final area is $$36cm^2$$.",
          "",
          "| Step | Expression |",
          "| --- | --- |",
          "| Substitute | \\(2x + 4 = 16\\) |",
          "| Solve | \\(x = 6\\) |",
          "",
          "Inline code should stay literal: `\\(not maths\\)`",
          "",
          "```",
          "\\[also not maths\\]",
          "```",
        ].join("\n"),
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
