import { prisma } from "@oakai/db";

import { isTruthy } from "remeda";

import {
  type CompletedLessonPlan,
  CompletedLessonPlanSchema,
} from "../../aila/src/protocol/schema";

/**
 * @todo Implement cache strategy for this function
 */
export async function getRagLessonPlansByIds({
  lessonPlanIds,
}: {
  lessonPlanIds: string[];
}): Promise<CompletedLessonPlan[]> {
  const lessonPlans = await prisma.ragLessonPlan.findMany({
    where: {
      id: {
        in: lessonPlanIds,
      },
    },
  });

  return lessonPlans
    .map((lp) => {
      const parseResult = CompletedLessonPlanSchema.safeParse(lp.lessonPlan);

      if (!parseResult.success) {
        // @todo error to sentry
        return null;
      }

      return parseResult.data;
    })
    .filter(isTruthy);
}
