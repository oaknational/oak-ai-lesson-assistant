import type { CompletedLessonPlan } from "@oakai/aila/src/protocol/schema";
import { CompletedLessonPlanSchema } from "@oakai/aila/src/protocol/schema";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import { getLessonPlanParts } from "../chunking/getLessonPlanParts";
import { loadLessonsAndUpdateState } from "../db-helpers/loadLessonsAndUpdateState";
import type { Step } from "../db-helpers/step";
import { getPrevStep } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import type { IngestLogger } from "../types";

const currentStep: Step = "chunking";
const prevStep = getPrevStep(currentStep);

/**
 * Create lesson plan 'parts' from lesson plans
 */
export async function lpChunking({
  prisma,
  log,
  ingestId,
}: {
  prisma: PrismaClientWithAccelerate;
  log: IngestLogger;
  ingestId: string;
}) {
  const lessons = await loadLessonsAndUpdateState({
    prisma,
    ingestId,
    prevStep,
    currentStep,
  });

  if (lessons.length === 0) {
    log.info("No lessons to chunk, exiting early");
    return;
  }

  log.info(`Chunking lesson plans for ${lessons.length} lesson`);

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
        log.error("Failed to parse lesson plan", { error });
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
          valueText: part.content,
          valueJson: part.json,
        })),
      });
      lessonIdsCompleted.push(lesson.id);
    } catch (error) {
      log.error("Failed to chunk lesson plan", { error });
      lessonIdsFailed.push(lesson.id);
    }
  }

  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessonIdsFailed,
    step: currentStep,
    stepStatus: "failed",
  });

  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessonIdsCompleted,
    step: currentStep,
    stepStatus: "completed",
  });

  log.info(`Chunking ${lessons.length} lesson plans completed`);
  log.info(`Failed: ${lessonIdsFailed.length}`);
}
