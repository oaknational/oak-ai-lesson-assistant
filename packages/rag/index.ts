import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

type RagLessonPlan = {
  id: string;
  oakLessonId: number | null;
  oakLessonSlug: string;
  ingestLessonId: string | null;
  lessonPlan: unknown;
  subjectSlug: string;
  keyStageSlug: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getRagLessonPlans(): Promise<RagLessonPlan[]> {
  return await prisma.ragLessonPlan.findMany();
}
