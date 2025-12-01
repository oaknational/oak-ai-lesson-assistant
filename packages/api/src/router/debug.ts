import { QuizRagDebugService } from "@oakai/aila/src/core/quiz/debug";
import {
  type StreamEvent,
  createStreamingInstrumentation,
  createTracer,
} from "@oakai/aila/src/core/quiz/tracing";
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

// Input schemas (shared with quizRagDebug)
const AilaRagRelevantLessonInputSchema = z.object({
  oakLessonId: z.number().nullish(),
  lessonPlanId: z.string(),
  title: z.string(),
});

const QuizTypeSchema = z.enum(["/starterQuiz", "/exitQuiz"]);

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

const debugRouterInternal = router({
  /**
   * Stream the quiz RAG debug pipeline with real-time updates.
   * Yields events as each stage starts and completes.
   */
  quizRagStream: adminProcedure
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
    .mutation(async function* ({ input }): AsyncGenerator<StreamEvent> {
      const { lessonPlan, quizType } = input;
      let { relevantLessons } = input;

      log.info(`Starting streaming debug pipeline for ${quizType}`);

      // Auto-fetch relevant lessons if not provided
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

      // Create streaming instrumentation
      const { instrumentation, eventIterator, complete } =
        createStreamingInstrumentation();
      const tracer = createTracer({ instrumentation });

      const debugService = new QuizRagDebugService();

      // Start pipeline in background
      const pipelinePromise = debugService
        .runDebugPipeline(lessonPlan, quizType, relevantLessons, tracer)
        .then((result) => {
          log.info(`Pipeline complete in ${result.timing.totalMs}ms`);
          return result;
        })
        .catch((error) => {
          log.error("Pipeline error:", error);
          throw error;
        })
        .finally(() => {
          complete();
        });

      // Yield events as they arrive
      for await (const event of eventIterator) {
        yield event;
      }

      // Wait for pipeline to finish and yield final result
      const result = await pipelinePromise;
      yield {
        type: "complete" as const,
        stage: "pipeline",
        data: result,
        timestamp: Date.now(),
      };
    }),
});

// Wrapped router for use in the combined tRPC client
export const debugRouter = router({
  debug: debugRouterInternal,
});

export type DebugRouter = typeof debugRouter;

// Export internal router for direct use in API route
export { debugRouterInternal };
