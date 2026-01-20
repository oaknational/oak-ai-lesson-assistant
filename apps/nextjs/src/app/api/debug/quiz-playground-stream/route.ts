import { buildQuizService } from "@oakai/aila/src/core/quiz/fullservices/buildQuizService";
import {
  ReportStorage,
  createQuizTracker,
} from "@oakai/aila/src/core/quiz/reporting";
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

import type { SSEEvent } from "@/app/admin/quiz-playground/types";

const log = aiLogger("admin");

async function isAdmin(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.emailAddresses.some((email) =>
    email.emailAddress.endsWith("@thenational.academy"),
  );
}

export async function POST(request: Request) {
  const { userId } = await auth();
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
    userInstructions = null,
  } = body as {
    lessonPlan: PartialLessonPlan;
    quizType: QuizPath;
    relevantLessons?: AilaRagRelevantLesson[];
    userInstructions?: string | null;
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

      const service = buildQuizService({
        sources: ["basedOnLesson", "similarLessons", "multiQuerySemantic"],
        enrichers: ["imageDescriptions"],
        composer: "llm",
      });

      try {
        await tracker.run(async (task, reportId) => {
          const quiz = await service.buildQuiz(
            quizType,
            lessonPlan,
            relevantLessons,
            task,
            reportId,
            userInstructions,
          );
          task.addData({ quiz });
        });

        const report = tracker.getReport();
        log.info(`Pipeline complete in ${report.durationMs}ms`, {
          reportId: report.reportId,
        });

        await ReportStorage.store(report);

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
