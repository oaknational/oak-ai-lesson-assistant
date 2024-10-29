import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { Step, StepStatus } from "./step";

export async function updateLessonsState({
  prisma,
  ingestId,
  lessonIds,
  step,
  stepStatus,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lessonIds: string[];
  step: Step;
  stepStatus: StepStatus;
}) {
  return prisma.ingestLesson.updateMany({
    where: {
      ingestId,
      id: {
        in: lessonIds,
      },
    },
    data: {
      step,
      stepStatus,
    },
  });
}
