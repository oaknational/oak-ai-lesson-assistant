import { buildFullQuizService } from "@oakai/aila/src/core/quiz/fullservices/buildFullQuizService";
import { createQuizTracker } from "@oakai/aila/src/core/quiz/instrumentation";
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

import type { SSEEvent } from "@/app/admin/quiz-rag/types";

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

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: SSEEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Create tracker with onUpdate for streaming
      const tracker = createQuizTracker({
        onUpdate: (snapshot) => {
          sendEvent({
            type: "report",
            data: snapshot,
            timestamp: Date.now(),
          });
        },
      });

      const service = buildFullQuizService({
        quizGenerators: ["basedOnRag", "rag", "ml-multi-term"],
        quizReranker: "no-op",
        quizSelector: "llm-quiz-composer",
      });

      try {
        await tracker.run(async (task) => {
          task.addData({
            inputs: { lessonPlan, quizType, relevantLessons },
          });
          const quiz = await service.buildQuiz(
            quizType,
            lessonPlan,
            relevantLessons,
            task,
          );
          task.addData({ quiz });
        });

        const report = tracker.getReport();
        log.info(`Pipeline complete in ${report.durationMs}ms`);

        sendEvent({
          type: "complete",
          data: report,
          timestamp: Date.now(),
        });
      } catch (error) {
        log.error("Pipeline error:", error);
        sendEvent({
          type: "error",
          data: { message: String(error) },
          timestamp: Date.now(),
        });
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
