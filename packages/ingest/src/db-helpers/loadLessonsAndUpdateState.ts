import { PrismaClientWithAccelerate } from "@oakai/db";

import { getLessonsByState } from "./getLessonsByState";
import { Step } from "./step";
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
   * Get all raw lessons which are ready for chunking
   */
  const lessons = await getLessonsByState({
    prisma,
    ingestId,
    step: prevStep,
    stepStatus: "completed",
  });

  /**
   * Update status to chunking started
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
