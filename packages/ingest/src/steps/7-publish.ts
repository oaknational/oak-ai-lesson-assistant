import {
  LessonPlanSchema,
  type LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import type { Prisma, PrismaClientWithAccelerate } from "@oakai/db";
import { createId } from "@paralleldrive/cuid2";
import { isTruthy } from "remeda";
import { z } from "zod";

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

  const lessons = await loadLessonsAndUpdateState({
    prisma,
    ingestId,
    prevStep,
    currentStep,
  });

  log.info(`Loaded ${lessons.length} lessons`);

  /**
   * Build list of lesson plans to publish
   */
  const ragLessonPlans: {
    oakLessonId?: number;
    oakLessonSlug: string;
    ingestLessonId?: string;
    subjectSlug: string;
    keyStageSlug: string;
    lessonPlan: LooseLessonPlan;
  }[] = lessons.map((lesson) => {
    if (!lesson.lessonPlan) {
      throw new IngestError("Lesson is missing lesson plan", {
        ingestId,
        lessonId: lesson.id,
      });
    }

    const lessonPlan = LessonPlanSchema.parse(lesson.lessonPlan.data);

    return {
      oakLessonId: lesson.oakLessonId,
      oakLessonSlug: lesson.data.lessonSlug,
      ingestLessonId: lesson.id,
      subjectSlug: lesson.data.subjectSlug,
      keyStageSlug: lesson.data.keyStageSlug,
      lessonPlan,
    };
  });

  log.info("About to chunk");

  /**
   * Add lesson plans to RAG schema
   */
  await chunkAndPromiseAll({
    data: ragLessonPlans,
    chunkSize: 500,
    fn: async (data) => {
      try {
        log.info(`Writing ${data.length} lesson plans`);
        await prisma.ragLessonPlan.createMany({
          data,
        });
        log.info(`Written ${data.length} lesson plans`);
      } catch (error) {
        log.error(error);
        throw error;
      }
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

    /**
     * @todo this takes ages one by one. group these queries
     */
    const lessonPlanParts = await prisma.$queryRaw`
      SELECT key, value_text, value_json, embedding::text
      FROM ingest.ingest_lesson_plan_part
      WHERE lesson_id = ${ingestLessonId}
    `;
    const parsedLessonPlanParts = z
      .array(
        z.object({
          key: z.string(),
          value_text: z.string(),
          value_json: z.union([
            z.string(),
            z.array(z.union([z.string(), z.object({}).passthrough()])),
            z.object({}).passthrough(),
          ]),
          embedding: z.string(),
        }),
      )
      .parse(lessonPlanParts);

    if (!lesson) {
      throw new IngestError("Lesson not found", {
        ingestId,
        lessonId: ingestLessonId ?? "NO_ID_PROVIDED",
      });
    }

    for (const part of parsedLessonPlanParts) {
      ragLessonPlanParts.push({
        ragLessonPlanId,
        key: part.key,
        valueText: part.value_text,
        valueJson: part.value_json,
        embedding: part.embedding.slice(1, -1).split(",").map(Number),
      });
    }
  }

  log.info(`Writing ${ragLessonPlanParts.length} lesson plan parts`);

  /**
   * Add lesson plan parts to RAG schema
   */
  await chunkAndPromiseAll({
    data: ragLessonPlanParts,
    chunkSize: 500,
    fn: async (data) => {
      const now = new Date().toISOString();
      // Need to use $queryRaw because Prisma doesn't support the vector type
      await prisma.$queryRaw`
             INSERT INTO rag.rag_lesson_plan_parts (id, rag_lesson_plan_id, key, value_text, value_json, created_at, updated_at, embedding)
             SELECT *
             FROM UNNEST (
                ARRAY[${data.map(() => createId())}]::text[],
                ARRAY[${data.map((p) => p.ragLessonPlanId)}]::text[],
                ARRAY[${data.map((p) => p.key)}]::text[],
                ARRAY[${data.map((p) => p.valueText)}]::text[],
                ARRAY[${data.map((p) => JSON.stringify(p.valueJson))}]::jsonb[],
                ARRAY[${data.map(() => now)}]::timestamp[],
                ARRAY[${data.map(() => now)}]::timestamp[],
                ARRAY[${data.map((p) => {
                  return "[" + p.embedding.join(",") + "]";
                })}]::vector[]
            );
      `;

      log.info(prisma.$queryRawUnsafe.toString());
    },
  });

  /**
   * In a transaction, update old versions of lesson plans to be unpublished
   * and the new versions to be published
   */
  await prisma.$transaction([
    prisma.ragLessonPlan.updateMany({
      where: {
        oakLessonSlug: {
          in: lessons.map((l) => l.data.lessonSlug),
        },
        id: {
          notIn: lessons.map((l) => l.id),
        },
      },
      data: {
        isPublished: false,
      },
    }),
    prisma.ragLessonPlan.updateMany({
      where: {
        id: {
          in: lessons.map((l) => l.id),
        },
      },
      data: {
        isPublished: true,
      },
    }),
  ]);

  // /**
  //  * Perform check to ensure no duplicate lesson plans are created
  //  */
  // const duplicateResults = await chunkAndPromiseAll({
  //   data: lessons,
  //   chunkSize: 500,
  //   fn: async (data) =>
  //     prisma.ragLessonPlan.findMany({
  //       where: {
  //         oakLessonSlug: {
  //           in: data.map((l) => l.data.lessonSlug),
  //         },
  //       },
  //       select: {
  //         ingestLessonId: true,
  //         oakLessonId: true,
  //         oakLessonSlug: true,
  //       },
  //     }),
  // });
  // const duplicateLessonPlans = duplicateResults.flat();

  // if (duplicateLessonPlans.length > 0) {
  //   log.error(`Duplicate lesson plans found: ${duplicateLessonPlans.length}`);
  //   throw new IngestError("Duplicate lesson plans found", {
  //     ingestId,
  //   });
  // }

  log.info("Published lesson plans and parts to RAG schema");
}
