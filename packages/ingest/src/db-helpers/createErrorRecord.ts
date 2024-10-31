import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { Step } from "./step";

export async function createErrorRecord({
  prisma,
  ingestId,
  lessonId,
  step,
  errorMessage,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lessonId: string | undefined;
  step: Step;
  errorMessage: string;
}) {
  return prisma.ingestError.create({
    data: {
      ingestId,
      lessonId,
      step,
      errorMessage,
    },
  });
}
