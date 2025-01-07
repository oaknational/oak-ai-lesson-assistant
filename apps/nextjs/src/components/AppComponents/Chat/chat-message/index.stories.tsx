import type { Meta, StoryObj } from "@storybook/react";

import { ChatModerationProvider } from "@/components/ContextProviders/ChatModerationContext";

import { ChatMessage } from "./";

const meta = {
  title: "Components/Chat/ChatMessage",
  component: ChatMessage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ChatModerationProvider chatId="test-chat-id">
        <Story />
      </ChatModerationProvider>
    ),
  ],
  args: {
    chatId: "test-chat-id",
    persistedModerations: [],
    ailaStreamingStatus: "Idle",
  },
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: {
    message: {
      id: "test-chat-id",
      content:
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      role: "user",
    },
  },
};

export const LlmMessage: Story = {
  args: {
    message: {
      id: "test-chat-id",
      content:
        '{"type":"llmMessage","sectionsToEdit":["learningOutcome","learningCycles"],"patches":[{"type":"patch","reasoning":"Since there are no existing Oak lessons for this topic, I have created a new lesson plan from scratch focusing on the end of Roman Britain.","value":{"type":"string","op":"add","path":"/learningOutcome","value":"I can explain the reasons behind the decline of Roman Britain and its impact on society."},"status":"complete"},{"type":"patch","reasoning":"I have outlined the learning cycles to break down the lesson structure for teaching about the end of Roman Britain.","value":{"type":"string-array","op":"add","path":"/learningCycles","value":["Identify the key events leading to the end of Roman Britain.","Describe the societal changes that occurred post-Roman withdrawal.","Analyse the archaeological evidence of Roman Britain\'s legacy."]},"status":"complete"}],"sectionsEdited":["learningOutcome","learningCycles"],"prompt":{"type":"text","value":"Are the learning outcome and learning cycles appropriate for your pupils? If not, suggest an edit. Otherwise, tap **Continue** to move on to the next step."},"status":"complete"}',
      role: "assistant",
    },
  },
};

export const ErrorMessage: Story = {
  args: {
    message: {
      id: "test-chat-id",
      role: "assistant",
      content:
        '{"type":"error","value":"Rate limit exceeded","message":"**Unfortunately you’ve exceeded your fair usage limit for today.** Please come back in 11 hours. If you require a higher limit, please [make a request](https://forms.gle/tHsYMZJR367zydsG8)."}',
    },
  },
};
