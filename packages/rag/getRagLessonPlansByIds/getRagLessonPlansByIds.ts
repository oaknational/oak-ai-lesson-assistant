import * as Sentry from "@sentry/nextjs";
import { isTruthy } from "remeda";
import invariant from "tiny-invariant";

import {
  type CompletedLessonPlan,
  CompletedLessonPlanSchema,
} from "../../aila/src/protocol/schema";
import { migrateLessonPlan } from "../../aila/src/protocol/schemas/versioning/migrateLessonPlan";

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
  const { prisma } = await import("@oakai/db");
  const lessonPlans = await prisma.ragLessonPlan.findMany({
    where: {
      id: {
        in: lessonPlanIds,
      },
    },
  });

  const results = await Promise.all(
    lessonPlans.map(async (lp, i) => {
      try {
        const { lessonPlan: migratedLessonPlan } = await migrateLessonPlan({
          lessonPlan: lp.lessonPlan as unknown as Record<string, unknown>,
          persistMigration: null,
          outputSchema: CompletedLessonPlanSchema,
        });

        const id = lessonPlanIds[i];
        invariant(id, "No id found for lesson plan, this should be impossible");

        return {
          ragLessonPlanId: lp.ingestLessonId ?? id,
          oakLessonId: lp.oakLessonId,
          oakLessonSlug: lp.oakLessonSlug,
          lessonPlan: migratedLessonPlan,
        };
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            ragLessonPlanId: lp.id,
            oakLessonId: lp.oakLessonId,
          },
        });
        return null;
      }
    }),
  );

  return results.filter(isTruthy);
}
