import {
  CompletedLessonPlan,
  CompletedLessonPlanSchema,
} from "@oakai/aila/src/protocol/schema";
import { prisma, PrismaClientWithAccelerate } from "@oakai/db";

import { getLessonPlanParts } from "../generate-lesson-plan-parts/getLessonPlanParts";
import {
  getLatestIngestId,
  getLessonsByState,
  updateLessonsState,
} from "./helpers";

lpChunking({
  prisma,
});

/**
 * Create lesson plan 'parts' from lesson plans
 */
export async function lpChunking({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });
  const lessons = await getLessonsByState({
    prisma,
    ingestId,
    step: "lesson_plan_generation",
    stepStatus: "completed",
  });
  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessons.map((l) => l.id),
    step: "chunking",
    stepStatus: "started",
  });

  const lessonIdsFailed: string[] = [];
  const lessonIdsCompleted: string[] = [];

  for (const lesson of lessons) {
    try {
      const lessonPlanRecord = lesson.lessonPlan;
      if (!lessonPlanRecord) {
        lessonIdsFailed.push(lesson.id);
        continue;
      }
      let lessonPlan: CompletedLessonPlan;
      try {
        lessonPlan = CompletedLessonPlanSchema.parse(lessonPlanRecord.data);
      } catch (error) {
        lessonIdsFailed.push(lesson.id);
        continue;
      }
      const parts = getLessonPlanParts({ lessonPlan });

      await prisma.ingestLessonPlanPart.createMany({
        data: parts.map((part) => ({
          ingestId,
          lessonId: lesson.id,
          lessonPlanId: lessonPlanRecord.id,
          key: part.key,
          textContent: part.content,
          data: part.json,
          batchId: null,
          embedding: null,
        })),
      });
      lessonIdsCompleted.push(lesson.id);
    } catch (error) {
      lessonIdsFailed.push(lesson.id);
    }
  }

  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessonIdsFailed,
    step: "chunking",
    stepStatus: "failed",
  });

  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessonIdsCompleted,
    step: "chunking",
    stepStatus: "completed",
  });
}
