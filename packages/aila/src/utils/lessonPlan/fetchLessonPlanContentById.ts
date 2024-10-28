import type { PrismaClientWithAccelerate } from "@oakai/db";

import { tryWithErrorReporting } from "../../helpers/errorReporting";
import type {
  LooseLessonPlan} from "../../protocol/schema";
import {
  LessonPlanSchemaWhilstStreaming
} from "../../protocol/schema";

export async function fetchLessonPlanContentById(
  id: string,
  prisma: PrismaClientWithAccelerate,
): Promise<LooseLessonPlan | null> {
  const lessonPlanRecord = await prisma.lessonPlan.findFirst({
    where: {
      id,
    },
    cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
  });

  if (!lessonPlanRecord) {
    return null;
  }
  const parsedPlan = tryWithErrorReporting(
    () => LessonPlanSchemaWhilstStreaming.parse(lessonPlanRecord.content),
    "Failed to parse lesson plan content",
    undefined,
    undefined,
    {
      lessonPlanContent: lessonPlanRecord.content,
    },
  );

  return parsedPlan;
}
