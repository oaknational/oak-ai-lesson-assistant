import type { PrismaClientWithAccelerate } from "@oakai/db";

import { tryWithErrorReporting } from "../../helpers/errorReporting";
import type { PartialLessonPlan } from "../../protocol/schema";
import { CompletedLessonPlanSchemaWithoutLength } from "../../protocol/schema";
import { migrateLessonPlan } from "../../protocol/schemas/versioning/migrateLessonPlan";

export async function fetchLessonPlanContentById(
  id: string,
  prisma: PrismaClientWithAccelerate,
): Promise<PartialLessonPlan | null> {
  const lessonPlanRecord = await prisma.lessonPlan.findFirst({
    where: {
      id,
    },
    cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
  });

  if (!lessonPlanRecord?.content) {
    return null;
  }

  const migrationResult = await tryWithErrorReporting(
    () =>
      migrateLessonPlan({
        lessonPlan: lessonPlanRecord.content as Record<string, unknown>,
        persistMigration: null,
        outputSchema: CompletedLessonPlanSchemaWithoutLength,
      }),
    "Failed to migrate and parse lesson plan content",
    undefined,
    undefined,
    {
      lessonPlanContent: lessonPlanRecord.content,
    },
  );

  return migrationResult?.lessonPlan ?? null;
}
