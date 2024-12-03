import type { PrismaClientWithAccelerate } from "@oakai/db";

import { getIngestById } from "../db-helpers/getIngestById";
import { loadLessonsAndUpdateState } from "../db-helpers/loadLessonsAndUpdateState";
import type { Step } from "../db-helpers/step";
import { getPrevStep } from "../db-helpers/step";
import { startEmbedding } from "../embedding/startEmbedding";
import { parseCustomId } from "../openai-batches/customId";
import type { IngestLogger } from "../types";
import { chunkAndPromiseAll } from "../utils/chunkAndPromiseAll";

const currentStep: Step = "embedding";
const prevStep = getPrevStep(currentStep);

/**
 * Start the process of embedding lesson plan parts
 */
export async function lpPartsEmbedStart({
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

  const allParts = lessons
    .map((lesson) =>
      lesson.lessonPlanParts.map((part) => ({
        lessonId: lesson.id,
        partKey: part.key,
        lessonPlanPartId: part.id,
        textToEmbed: part.valueText,
        ingest,
      })),
    )
    .flat();

  if (allParts.length === 0) {
    log.info("No lesson plan parts to embed, exiting early");
    return;
  }

  await startEmbedding({
    ingestId,
    parts: allParts,
    onSubmitted: async ({ openaiBatchId, filePath, customIds }) => {
      const batch = await prisma.ingestOpenAiBatch.create({
        data: {
          ingestId,
          batchType: "embedding",
          openaiBatchId,
          inputFilePath: filePath,
          status: "pending",
        },
      });

      const lessonPlanPartIds = customIds
        .map((customId) =>
          parseCustomId({
            task: "embed-lesson-plan-parts",
            customId,
          }),
        )
        .map(({ lessonPlanPartId }) => lessonPlanPartId);

      await chunkAndPromiseAll({
        data: lessonPlanPartIds,
        fn: async (lessonPlanPartIds) => {
          await prisma.ingestLessonPlanPart.updateMany({
            where: {
              id: {
                in: lessonPlanPartIds.filter(
                  (i): i is string => typeof i === "string",
                ),
              },
            },
            data: {
              batchId: batch.id,
            },
          });
        },
        chunkSize: 25000,
      });
    },
  });
}
