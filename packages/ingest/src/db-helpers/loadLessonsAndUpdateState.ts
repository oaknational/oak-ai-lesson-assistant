import type { PrismaClientWithAccelerate } from "@oakai/db";

import { getLessonsByState } from "./getLessonsByState";
import type { Step } from "./step";
import { updateLessonsState } from "./updateLessonsState";

export async function loadLessonsAndUpdateState({
  prisma,
  ingestId,
  prevStep,
  currentStep,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  prevStep: Step;
  currentStep: Step;
}) {
  /**
   * Get lessons which have completed the previous step
   */
  const lessons = await getLessonsByState({
    prisma,
    ingestId,
    step: prevStep,
    stepStatus: "completed",
  });

  /**
   * Update lessons step to the current step, and set status to started
   */
  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessons.map((l) => l.id),
    step: currentStep,
    stepStatus: "started",
  });

  return lessons;
}
