import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";

import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { AdminChatView } from "./view";

const meta = {
  title: "Pages/Admin/Aila/[chatId]/View",
  component: AdminChatView,
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof AdminChatView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chat: {
      lessonPlan: {
        title: "A naughty lesson plan",
      },
    } as AilaPersistedChat,
    moderations: [
      {
        id: "cm654k0a50007tf413jc6po5f",
        createdAt: new Date("2025-01-20T14:11:26.957Z"),
        updatedAt: new Date("2025-01-20T14:11:26.957Z"),
        userId: "user_2nQuq4jFWLfo4w1WNA6xEBp93IY",
        appSessionId: "ElzgFmHVS6JTdldd",
        messageId: "a-bMjytJMVEJYa24Lk",
        categories: ["t/encouragement-violence"],
        scores: null,
        justification: "Mock toxic result",
        lessonSnapshotId: "cm654k08y0005tf412e0g9f5y",
        userComment: null,
        invalidatedAt: null,
        invalidatedBy: null,
      },
      {
        id: "cm654iz8z0003tf41e42karvo",
        createdAt: new Date("2025-01-20T14:10:38.963Z"),
        updatedAt: new Date("2025-01-20T14:10:38.963Z"),
        userId: "user_2nQuq4jFWLfo4w1WNA6xEBp93IY",
        appSessionId: "ElzgFmHVS6JTdldd",
        messageId: "a-ZAlNJ9Dykdu0TLoB",
        categories: [],
        scores: { l: 5, p: 5, s: 5, t: 5, u: 5, v: 5 },
        justification:
          "The lesson plan titled 'The end of Roman Britain' for key-stage-3 history is fully compliant across all categories. It focuses on historical events and their impacts without involving any sensitive or inappropriate content. There is no use of discriminatory or offensive language, nor any depiction of violence or conflict beyond the historical context, which is appropriate for the age group. The content does not include any upsetting, sensitive, or distressing material, nor does it involve nudity or sexual content. There is no physical activity or safety concerns associated with the lesson, and it does not contain any toxic or harmful instructions or encouragement. Overall, the lesson plan is suitable for the intended educational purpose and audience.",
        lessonSnapshotId: "cm654ito20001tf41k2fbjeu6",
        userComment: null,
        invalidatedAt: null,
        invalidatedBy: null,
      },
    ],
    safetyViolations: [
      {
        id: "cm654k0cm0008tf410t5ml610",
        createdAt: new Date("2025-01-20T14:11:27.047Z"),
        updatedAt: new Date("2025-01-20T14:11:27.047Z"),
        userId: "user_2nQuq4jFWLfo4w1WNA6xEBp93IY",
        userAction: "CHAT_MESSAGE",
        detectionSource: "MODERATION",
        recordType: "MODERATION",
        recordId: "cm654k0a50007tf413jc6po5f",
      },
    ],
  },
};
