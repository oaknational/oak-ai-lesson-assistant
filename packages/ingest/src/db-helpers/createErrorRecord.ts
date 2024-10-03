import { PrismaClientWithAccelerate } from "@oakai/db";

import { Step } from "./step";

export async function createErrorRecord({
  prisma,
  ingestId,
  lessonId,
  step,
  errorMessage,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lessonId: string;
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
