import { QuizRagDebugService } from "@oakai/aila/src/core/quiz/debug";
import { migrateChatData } from "@oakai/aila/src/protocol/schemas/versioning/migrateChatData";
import { aiLogger } from "@oakai/logger";
import {
  getRelevantLessonPlans,
  parseKeyStagesForRagSearch,
  parseSubjectsForRagSearch,
} from "@oakai/rag";

import { z } from "zod";

import { adminProcedure } from "../middleware/adminAuth";
import { router } from "../trpc";

const log = aiLogger("admin");

// Input schemas
const AilaRagRelevantLessonInputSchema = z.object({
  oakLessonId: z.number().nullish(),
  lessonPlanId: z.string(),
  title: z.string(),
});

const QuizTypeSchema = z.enum(["/starterQuiz", "/exitQuiz"]);

// Simplified lesson plan schema for input - accepts any object
// The actual validation happens in the quiz services
const LessonPlanInputSchema = z
  .object({
    title: z.string().optional(),
    subject: z.string().optional(),
    keyStage: z.string().optional(),
    topic: z.string().optional(),
    learningOutcome: z.string().optional(),
    learningCycles: z.array(z.string()).optional(),
    priorKnowledge: z.array(z.string()).optional(),
    keyLearningPoints: z.array(z.string()).optional(),
    misconceptions: z.array(z.any()).optional(),
    keywords: z.array(z.any()).optional(),
    basedOn: z
      .object({
        id: z.string(),
        title: z.string(),
      })
      .nullish(),
  })
  .passthrough();

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
   * Run the full debug pipeline
   */
  runDebugPipeline: adminProcedure
    .input(
      z.object({
        lessonPlan: LessonPlanInputSchema,
        quizType: QuizTypeSchema,
        relevantLessons: z
          .array(AilaRagRelevantLessonInputSchema)
          .optional()
          .default([]),
      }),
    )
    .mutation(async ({ input }) => {
      const { lessonPlan, quizType } = input;
      let { relevantLessons } = input;

      log.info(`Running debug pipeline for ${quizType}`);
      log.info(`Lesson plan: ${lessonPlan.title}`);

      // Auto-fetch relevant lessons if not provided and we have the required metadata
      if (
        relevantLessons.length === 0 &&
        lessonPlan.title &&
        lessonPlan.subject &&
        lessonPlan.keyStage
      ) {
        log.info(`Fetching relevant lessons for: ${lessonPlan.title}`);
        const subjectSlugs = parseSubjectsForRagSearch(lessonPlan.subject);
        const keyStageSlugs = parseKeyStagesForRagSearch(lessonPlan.keyStage);

        const ragResults = await getRelevantLessonPlans({
          title: lessonPlan.title,
          subjectSlugs,
          keyStageSlugs,
        });

        relevantLessons = ragResults.map((result) => ({
          oakLessonId: result.oakLessonId,
          lessonPlanId: result.ragLessonPlanId,
          title: result.lessonPlan.title,
        }));

        log.info(`Auto-fetched ${relevantLessons.length} relevant lessons`);
      }

      log.info(`Relevant lessons: ${relevantLessons.length}`);

      const debugService = new QuizRagDebugService();
      const result = await debugService.runDebugPipeline(
        lessonPlan,
        quizType,
        relevantLessons,
      );

      log.info(`Debug pipeline complete in ${result.timing.totalMs}ms`);

      return result;
    }),

  /**
   * Get example lesson plans for the dropdown
   */
  getExampleLessonPlans: adminProcedure.query(() => {
    return EXAMPLE_LESSON_PLANS;
  }),
});
