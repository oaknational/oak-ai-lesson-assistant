import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "../../../../../.storybook/chromatic";
import { DemoProvider } from "../../../../../src/components/ContextProviders/Demo";
import { DownloadContent } from "./DownloadView";

const meta: Meta<typeof DownloadContent> = {
  title: "Pages/Chat/Download",
  component: DownloadContent,
  parameters: {
    layout: "fullscreen",
    ...chromaticParams(["mobile", "legacy"]),
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DownloadContent>;

const chat: AilaPersistedChat = {
  id: "nSLmbQ1LO75zLTcA",
  path: "/aila/nSLmbQ1LO75zLTcA",
  title: "The End of Roman Britain",
  userId: "user_2nQuq4jFWLfo4w1WNA6xEBp93IY",
  lessonPlan: {
    title: "The End of Roman Britain",
    subject: "history",
    keyStage: "key-stage-3",
    learningOutcome:
      "I can explain the factors leading to the end of Roman rule in Britain and its impact on society.",
    learningCycles: [
      "Identify the key factors that led to the exit of the Romans from Britain.",
      "Discuss the immediate social and economic impacts of the Roman departure on Britain.",
      "Explore how archaeologists have uncovered evidence of the Roman era in Britain.",
    ],
  },
  relevantLessons: [],
  createdAt: 1732008272042,
  updatedAt: 1732008303927,
  iteration: 2,
  messages: [
    {
      id: "u-Mksqgrrlq7-02EvL",
      content:
        "Create a lesson plan about The End of Roman Britain for Key Stage 3 History",
      role: "user",
    },
    {
      id: "a-ttJ8OIwaxn4aFEOq",
      content:
        '{"type":"llmMessage","sectionsToEdit":["learningOutcome","learningCycles"],"patches":[{"type":"patch","reasoning":"Creating a new lesson plan from scratch as no existing Oak lessons are available for this topic. Setting a clear learning outcome and defining the learning cycles to structure the lesson effectively.","value":{"type":"string","op":"add","path":"/learningOutcome","value":"I can explain the factors leading to the end of Roman rule in Britain and its impact on society."},"status":"complete"},{"type":"patch","reasoning":"Outlining the learning cycles to provide a structured approach to teaching the factors leading to the end of Roman Britain, the immediate effects, and the archaeological evidence.","value":{"type":"string-array","op":"add","path":"/learningCycles","value":["Identify the key factors that led to the exit of the Romans from Britain.","Discuss the immediate social and economic impacts of the Roman departure on Britain.","Explore how archaeologists have uncovered evidence of the Roman era in Britain."]},"status":"complete"}],"sectionsEdited":["learningOutcome","learningCycles"],"prompt":{"type":"text","value":"Are the learning outcome and learning cycles appropriate for your pupils? If not, suggest an edit. Otherwise, tap **Continue** to move on to the next step."},"status":"complete"}',
      role: "assistant",
    },
  ],
  subject: "history",
  keyStage: "key-stage-3",
};

export const Default: Story = {
  args: {
    chat,
  },
};
