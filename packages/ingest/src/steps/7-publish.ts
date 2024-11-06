import { Prisma, PrismaClientWithAccelerate } from "@oakai/db";
import { createId } from "@paralleldrive/cuid2";
import { isTruthy } from "remeda";

import { IngestError } from "../IngestError";
import { getIngestById } from "../db-helpers/getIngestById";
import { loadLessonsAndUpdateState } from "../db-helpers/loadLessonsAndUpdateState";
import { Step, getPrevStep } from "../db-helpers/step";
import { IngestLogger } from "../types";

const currentStep: Step = "publishing";
const prevStep = getPrevStep(currentStep);

/**
 * Publish ingest lesson_plans and lesson_plan_parts to the rag schema
 */
export async function publish({
  prisma,
  log,
  ingestId,
}: {
  prisma: PrismaClientWithAccelerate;
  log: IngestLogger;
  ingestId: string;
}) {
  const ingest = await getIngestById({ prisma, ingestId });
  const lessons = await loadLessonsAndUpdateState({
    prisma,
    ingestId,
    prevStep,
    currentStep,
  });

  const ragLessonPlans = lessons
    .map((l) =>
      l.lessonPlan
        ? {
            ...l.lessonPlan,
            ingestLessonId: l.id,
            oakLessonId: l.oakLessonId,
            subjectSlug: l.data.subjectSlug,
            keyStageSlug: l.data.keyStageSlug,
          }
        : null,
    )
    .filter(isTruthy)
    .map((lp) => ({
      ingestLessonId: lp.ingestLessonId,
      oakLessonId: lp.oakLessonId,
      lessonPlan: lp.data as object,
      subjectSlug: lp.subjectSlug,
      keyStageSlug: lp.keyStageSlug,
    }));

  await prisma.ragLessonPlan.createMany({
    data: ragLessonPlans,
  });

  const persistedRagLessonPlans = await prisma.ragLessonPlan.findMany({
    where: {
      ingestLessonId: {
        in: ragLessonPlans.map((lp) => lp.ingestLessonId),
      },
    },
  });
  //   const ingestLessonPlanParts = await prisma.ingestLessonPlanPart.findMany({});

  //   const ragLessonPlanIds = persistedRagLessonPlans.map((lp) => lp.id);

  //   const keys = ragLessonPlans.flatMap((lp) => Object.keys(lp.lessonPlan));

  //   await prisma.$queryRaw`
  //          INSERT INTO rag.rag_lesson_plan_parts (id, rag_lesson_plan_id, key, value_text, value_json, embedding)
  //         SELECT *
  //         FROM UNNEST (
  //             ${ragLessonPlanParts.map((p) => p.id)}::text[],
  //             ${ragLessonPlanParts.map((p) => p.ragLessonPlanId)}::text[],
  //             ${ragLessonPlanParts.map((p) => p.key)}::text[],
  //             ${ragLessonPlanParts.map((p) => p.valueText)}::text[],
  //             ${ragLessonPlanParts.map((p) => p.valueJson)}::jsonb[],
  //             ${ragLessonPlanParts.map((p) => `{${Array.from(p.embedding).join(",")}}`)}::vector(256)[]
  //         );
  //   `;
}
