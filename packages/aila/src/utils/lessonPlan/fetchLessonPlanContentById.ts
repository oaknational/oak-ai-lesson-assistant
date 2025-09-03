import type { PrismaClientWithAccelerate } from "@oakai/db";

import invariant from "tiny-invariant";

import { tryWithErrorReporting } from "../../helpers/errorReporting";
import type { LooseLessonPlan } from "../../protocol/schema";
import { CompletedLessonPlanSchemaWithoutLength } from "../../protocol/schema";
import { upgradeQuizzes } from "../../protocol/schemas/quiz/conversion/lessonPlanQuizMigrator";

// asserts that the object has a lessonPlan property
function hasLessonPlanKey(obj: unknown): obj is { lessonPlan: unknown } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "lessonPlan" in obj &&
    typeof obj.lessonPlan === "object" &&
    obj.lessonPlan !== null
  );
}

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

  const upgradeResult = await upgradeQuizzes({
    data: {
      lessonPlan: lessonPlanRecord.content,
    },
    persistUpgrade: null,
  });

  // upgradeQuizzes expects and returns an object with a lessonPlan property
  invariant(
    hasLessonPlanKey(upgradeResult.data),
    "Failed to upgrade lesson plan content",
  );
  const upgradedLessonPlan = upgradeResult.data.lessonPlan;

  const parsedPlan = tryWithErrorReporting(
    // RAG lesson plans have all fields but can have different length for answers, keywords, etc
    () => CompletedLessonPlanSchemaWithoutLength.parse(upgradedLessonPlan),
    "Failed to parse lesson plan content",
    undefined,
    undefined,
    {
      lessonPlanContent: lessonPlanRecord.content,
    },
  );

  return parsedPlan;
}
