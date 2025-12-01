import type {
  QuizRagDebugResult,
  QuizRagStreamingReport,
} from "@oakai/aila/src/core/quiz/debug";
import { QuizRagDebugService } from "@oakai/aila/src/core/quiz/debug";
import {
  createReportStreamingInstrumentation,
  createTracer,
} from "@oakai/aila/src/core/quiz/tracing";
import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import {
  getRelevantLessonPlans,
  parseKeyStagesForRagSearch,
  parseSubjectsForRagSearch,
} from "@oakai/rag";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const log = aiLogger("admin");

const debugEnabled =
  process.env.NODE_ENV === "development" ||
  process.env.VERCEL_ENV === "preview";

async function isAdmin(userId: string): Promise<boolean> {
  const user = await clerkClient.users.getUser(userId);
  return user.emailAddresses.some((email) =>
    email.emailAddress.endsWith("@thenational.academy"),
  );
}

/**
 * SSE event types for the streaming response.
 * - "report": Updated pipeline report with current stage states
 * - "complete": Final result with full debug data
 * - "error": Pipeline error
 */
interface SSEEvent {
  type: "report" | "complete" | "error";
  data: QuizRagStreamingReport | QuizRagDebugResult | { message: string };
  timestamp: number;
}

export async function POST(request: Request) {
  if (!debugEnabled) {
    return NextResponse.json(
      { error: "Debug endpoint not available" },
      { status: 404 },
    );
  }

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await isAdmin(userId);
  if (!admin) {
    return NextResponse.json({ error: "Not an admin" }, { status: 403 });
  }

  const body = await request.json();
  const {
    lessonPlan,
    quizType,
    relevantLessons: inputRelevantLessons = [],
  } = body as {
    lessonPlan: PartialLessonPlan;
    quizType: QuizPath;
    relevantLessons?: AilaRagRelevantLesson[];
  };

  log.info(`Starting SSE streaming debug pipeline for ${quizType}`);

  // Auto-fetch relevant lessons if not provided
  let relevantLessons = inputRelevantLessons;
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

  // Create report-based streaming instrumentation
  // The report accumulates stage states and emits after each update
  const { instrumentation, reportIterator, complete } =
    createReportStreamingInstrumentation();
  const tracer = createTracer({ instrumentation });

  const debugService = new QuizRagDebugService();

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: SSEEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Start pipeline in background - instrumentation updates report as spans complete
      const pipelinePromise = debugService
        .runDebugPipeline(lessonPlan, quizType, relevantLessons, tracer)
        .then((result) => {
          log.info(`Pipeline complete in ${result.timing.totalMs}ms`);
          return result;
        })
        .catch((error) => {
          log.error("Pipeline error:", error);
          sendEvent({
            type: "error",
            data: { message: String(error) },
            timestamp: Date.now(),
          });
          throw error;
        })
        .finally(() => {
          complete();
        });

      // Stream report updates as they arrive
      try {
        for await (const report of reportIterator) {
          sendEvent({
            type: "report",
            data: report,
            timestamp: Date.now(),
          });
        }

        // Send final complete event with full debug result
        const result = await pipelinePromise;
        sendEvent({
          type: "complete",
          data: result,
          timestamp: Date.now(),
        });
      } catch (error) {
        log.error("Streaming error:", error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
