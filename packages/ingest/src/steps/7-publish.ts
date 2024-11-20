import {
  LessonPlanSchema,
  type LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import type { Prisma } from "@oakai/db";
import { isTruthy } from "remeda";

import { IngestError } from "../IngestError";
import { loadLessonsAndUpdateState } from "../db-helpers/loadLessonsAndUpdateState";
import type { Step } from "../db-helpers/step";
import { getPrevStep } from "../db-helpers/step";
import type { IngestLogger } from "../types";
import { chunkAndPromiseAll } from "../utils/chunkAndPromiseAll";

const currentStep: Step = "publishing";
const prevStep = getPrevStep(currentStep);

/**
 * Publish ingest lesson_plans and lesson_plan_parts to the rag schema
 */
export async function publishToRag({
  prisma,
  log,
  ingestId,
}: {
  prisma: PrismaClientWithAccelerate;
  log: IngestLogger;
  ingestId: string;
}) {
  log.info("Publishing lesson plans and parts to RAG schema");
  // const ingest = await getIngestById({ prisma, ingestId });
  const lessons = await loadLessonsAndUpdateState({
    prisma,
    ingestId,
    prevStep,
    currentStep,
  });

  log.info(`Loaded ${lessons.length} lessons`);

  const ragLessonPlans: {
    oakLessonId?: number;
    oakLessonSlug: string;
    ingestLessonId?: string;
    subjectSlug: string;
    keyStageSlug: string;
    lessonPlan: LooseLessonPlan;
  }[] = [];

  for (const lesson of lessons) {
    if (!lesson.lessonPlan) {
      throw new IngestError("Lessin is missing lesson plan", {
        ingestId,
        lessonId: lesson.id,
      });
    }

    const lessonPlan = LessonPlanSchema.parse(lesson.lessonPlan);
    ragLessonPlans.push({
      oakLessonId: lesson.oakLessonId,
      oakLessonSlug: lesson.data.lessonSlug,
      ingestLessonId: lesson.id,
      subjectSlug: lesson.data.subjectSlug,
      keyStageSlug: lesson.data.keyStageSlug,
      lessonPlan,
    });
  }

  /**
   * Add lesson plans to RAG schema
   */
  await chunkAndPromiseAll({
    data: ragLessonPlans,
    chunkSize: 100,
    fn: async (data) => {
      await prisma.ragLessonPlan.createMany({
        data,
      });
    },
  });

  log.info(`Written ${ragLessonPlans.length} lesson plans`);

  /**
   * Fetch persisted lesson plans (with ids)
   */
  const persistedRagLessonPlans = await prisma.ragLessonPlan.findMany({
    where: {
      ingestLessonId: {
        in: ragLessonPlans.map((lp) => lp.ingestLessonId).filter(isTruthy),
      },
    },
    select: {
      id: true,
      ingestLessonId: true,
    },
  });

  const ragLessonPlanParts: {
    ragLessonPlanId: string;
    key: string;
    valueText: string;
    valueJson: Prisma.JsonValue;
    embedding: number[];
  }[] = [];

  for (const ragLessonPlan of persistedRagLessonPlans) {
    const ragLessonPlanId = ragLessonPlan.id;
    const ingestLessonId = ragLessonPlan.ingestLessonId;
    const lesson = lessons.find((l) => l.id === ingestLessonId);
    if (!lesson) {
      throw new IngestError("Lesson not found", {
        ingestId,
        lessonId: ingestLessonId ?? "NO_ID_PROVIDED",
      });
    }

    for (const part of lesson.lessonPlanParts) {
      ragLessonPlanParts.push({
        ragLessonPlanId,
        key: part.key,
        valueText: part.valueText,
        valueJson: part.valueJson,
        embedding: [],
      });
    }
  }

  log.info(`Writing ${ragLessonPlanParts.length} lesson plan parts`);

  /**
   * Add lesson plan parts to RAG schema
   */
  await chunkAndPromiseAll({
    data: ragLessonPlanParts,
    chunkSize: 100,
    fn: async (data) => {
      // Need to use $queryRaw because Prisma doesn't support the vector type
      await prisma.$queryRaw`
           INSERT INTO rag.rag_lesson_plan_parts (rag_lesson_plan_id, key, value_text, value_json, embedding)
          SELECT *
          FROM UNNEST (
              ${data.map((p) => p.ragLessonPlanId)}::text[],
              ${data.map((p) => p.key)}::text[],
              ${data.map((p) => p.valueText)}::text[],
              ${data.map((p) => p.valueJson)}::jsonb[],
              ${data.map((p) => `{${Array.from(p.embedding).join(",")}}`)}::vector(256)[]
          );
    `;
    },
  });

  log.info("Published lesson plans and parts to RAG schema");
}
