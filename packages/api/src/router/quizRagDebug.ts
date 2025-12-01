import { migrateChatData } from "@oakai/aila/src/protocol/schemas/versioning/migrateChatData";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import { adminProcedure } from "../middleware/adminAuth";
import { router } from "../trpc";

const log = aiLogger("admin");

// Example lesson plans for the dropdown
const EXAMPLE_LESSON_PLANS = [
  {
    id: "circle-theorems",
    label: "Circle Theorems (KS4 Maths)",
    plan: {
      title: "Circle theorems",
      subject: "maths",
      keyStage: "key-stage-4",
      topic: "Circle theorems",
      learningOutcome:
        "I can apply circle theorems to solve problems involving angles in circles.",
      priorKnowledge: [
        "I can identify and name parts of a circle including radius, diameter, chord, tangent, and arc.",
        "I can calculate angles in triangles and quadrilaterals.",
        "I understand that angles on a straight line sum to 180°.",
      ],
      keyLearningPoints: [
        "The angle at the centre is twice the angle at the circumference.",
        "Angles in the same segment are equal.",
        "The angle in a semicircle is 90°.",
        "Opposite angles of a cyclic quadrilateral sum to 180°.",
      ],
    },
  },
  {
    id: "circle-theorems-based-on",
    label: "Circle Theorems - with basedOn (KS4 Maths)",
    plan: {
      title: "Circle theorems",
      subject: "maths",
      keyStage: "key-stage-4",
      topic: "Circle theorems",
      learningOutcome:
        "I can apply circle theorems to solve problems involving angles in circles.",
      priorKnowledge: [
        "I can identify and name parts of a circle including radius, diameter, chord, tangent, and arc.",
        "I can calculate angles in triangles and quadrilaterals.",
        "I understand that angles on a straight line sum to 180°.",
      ],
      keyLearningPoints: [
        "The angle at the centre is twice the angle at the circumference.",
        "Angles in the same segment are equal.",
        "The angle in a semicircle is 90°.",
        "Opposite angles of a cyclic quadrilateral sum to 180°.",
      ],
      basedOn: {
        id: "circle-theorems-i",
        title: "Circle theorems I",
      },
    },
  },
  {
    id: "solving-equations",
    label: "Solving Linear Equations (KS3 Maths)",
    plan: {
      title: "Solving linear equations",
      subject: "maths",
      keyStage: "key-stage-3",
      topic: "Equations",
      learningOutcome:
        "I can solve linear equations with the unknown on both sides.",
      priorKnowledge: [
        "I can solve one-step equations.",
        "I can use inverse operations.",
        "I can collect like terms.",
      ],
      keyLearningPoints: [
        "To solve equations, we perform the same operation on both sides.",
        "We collect the variable terms on one side and constants on the other.",
        "We can check our solution by substituting back into the original equation.",
      ],
    },
  },
  {
    id: "fractions-addition",
    label: "Adding Fractions (KS3 Maths)",
    plan: {
      title: "Adding fractions with different denominators",
      subject: "maths",
      keyStage: "key-stage-3",
      topic: "Fractions",
      learningOutcome:
        "I can add fractions with different denominators by finding a common denominator.",
      priorKnowledge: [
        "I can add fractions with the same denominator.",
        "I can find equivalent fractions.",
        "I can find the lowest common multiple of two numbers.",
      ],
      keyLearningPoints: [
        "To add fractions with different denominators, we first find a common denominator.",
        "We convert each fraction to an equivalent fraction with the common denominator.",
        "We then add the numerators and keep the denominator the same.",
        "The answer should be simplified if possible.",
      ],
    },
  },
];

export const quizRagDebugRouter = router({
  /**
   * Get lesson plan data from an existing chat session
   */
  getLessonPlanByChatId: adminProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { chatId } = input;
      const { prisma } = ctx;

      log.info(`Fetching lesson plan for chat: ${chatId}`);

      const chatRecord = await prisma.appSession.findUnique({
        where: { id: chatId },
      });

      if (!chatRecord) {
        log.warn(`Chat not found: ${chatId}`);
        return null;
      }

      const chat = await migrateChatData(
        chatRecord.output,
        async (upgradedData) => {
          await prisma.appSession.update({
            where: { id: chatId },
            data: { output: upgradedData },
          });
        },
        {
          id: chatRecord.id,
          userId: chatRecord.userId,
          caller: "quizRagDebug.getLessonPlanByChatId",
        },
      );

      return {
        lessonPlan: chat.lessonPlan,
        relevantLessons: chat.relevantLessons ?? [],
        title: chat.title,
      };
    }),

  /**
   * Get example lesson plans for the dropdown
   */
  getExampleLessonPlans: adminProcedure.query(() => {
    return EXAMPLE_LESSON_PLANS;
  }),
});
