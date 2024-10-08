import { PrismaClientWithAccelerate } from "@oakai/db";

import { RawLessonSchema } from "../zod-schema/zodSchema";
import { Step, StepStatus } from "./step";

export async function getLessonsByState({
  prisma,
  ingestId,
  step,
  stepStatus,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  step: Step;
  stepStatus: StepStatus;
}) {
  const lessons = await prisma.ingestLesson.findMany({
    where: {
      ingest: {
        status: "active",
      },
      ingestId,
      step,
      stepStatus,
    },
    include: {
      captions: true,
      lessonPlan: true,
      lessonPlanParts: true,
    },
  });
  return lessons.map((lesson) => ({
    ...lesson,
    data: RawLessonSchema.parse(lesson.data),
  }));
}
