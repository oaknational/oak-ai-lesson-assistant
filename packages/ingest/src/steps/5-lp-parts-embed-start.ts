import { PrismaClientWithAccelerate } from "@oakai/db";

import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { loadLessonsAndUpdateState } from "../db-helpers/loadLessonsAndUpdateState";
import { Step, getPrevStep } from "../db-helpers/step";
import { startEmbedding } from "../embedding/startEmbedding";
import { parseCustomId } from "../openai-batches/customId";

const currentStep: Step = "embedding";
const prevStep = getPrevStep(currentStep);

/**
 * Start the process of embedding lesson plan parts
 */
export async function lpPartsEmbedStart({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });
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
      })),
    )
    .flat();

  if (allParts.length === 0) {
    console.log("No lesson plan parts to embed, exiting early");
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

      await prisma.ingestLessonPlanPart.updateMany({
        where: {
          id: {
            in: lessonPlanPartIds,
          },
        },
        data: {
          batchId: batch.id,
        },
      });
    },
  });
}
