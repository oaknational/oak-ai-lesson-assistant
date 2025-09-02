import { prisma } from "@oakai/db";

import { isTruthy } from "remeda";
import invariant from "tiny-invariant";

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
  /**
   * lessonPlanId is the legacy name for ragLessonPlanId
   * i.e. the id of the record associated with that particular ingest/RAG interpretation of the Oak lesson
   */
  lessonPlanIds: string[];
}): Promise<
  {
    ragLessonPlanId: string;
    oakLessonId: number | null;
    oakLessonSlug: string;
    lessonPlan: CompletedLessonPlan;
  }[]
> {
  const lessonPlans = await prisma.ragLessonPlan.findMany({
    where: {
      id: {
        in: lessonPlanIds,
      },
    },
  });

  return lessonPlans
    .map((lp, i) => {
      const parseResult = CompletedLessonPlanSchema.safeParse(lp.lessonPlan);

      if (!parseResult.success) {
        // @todo error to sentry
        return null;
      }

      const id = lessonPlanIds[i];

      invariant(id, "No id found for lesson plan, this should be impossible");

      return {
        ragLessonPlanId: lp.ingestLessonId ?? id,
        oakLessonId: lp.oakLessonId,
        oakLessonSlug: lp.oakLessonSlug,
        lessonPlan: parseResult.data,
      };
    })
    .filter(isTruthy);
}
