import type { PrismaClientWithAccelerate } from "@oakai/db";

import * as Sentry from "@sentry/nextjs";
import { isTruthy } from "remeda";

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
  prisma,
}: {
  /**
   * lessonPlanId is the legacy name for ragLessonPlanId
   * i.e. the id of the record associated with that particular ingest/RAG interpretation of the Oak lesson
   */
  lessonPlanIds: string[];
  prisma: PrismaClientWithAccelerate;
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
      isPublished: true,
    },
  });

  // findMany returns rows in database order, not lessonPlanIds order.
  // Callers number lessons in search order ("1. ..."), so keep that order.
  const position = new Map(
    lessonPlanIds.map((lessonPlanId, index) => [lessonPlanId, index]),
  );
  lessonPlans.sort(
    (first, second) =>
      (position.get(first.id) ?? 0) - (position.get(second.id) ?? 0),
  );

  const results = await Promise.all(
    lessonPlans.map(async (lp) => {
      try {
        const { lessonPlan: migratedLessonPlan } = await migrateLessonPlan({
          lessonPlan: lp.lessonPlan as unknown as Record<string, unknown>,
          persistMigration: null,
          outputSchema: CompletedLessonPlanSchema,
        });

        return {
          ragLessonPlanId: lp.id,
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
