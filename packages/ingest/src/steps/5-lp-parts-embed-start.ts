import { PrismaClientWithAccelerate } from "@oakai/db";

import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { getLessonsByState } from "../db-helpers/getLessonsByState";
import { Step, getPrevStep } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { startEmbedding } from "../embedding/startEmbedding";

const step: Step = "embedding";
const prevStep = getPrevStep(step);

/**
 * Start the process of embedding lesson plan parts
 */
export async function lpPartsEmbedStart({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });
  const lessons = await getLessonsByState({
    prisma,
    ingestId,
    step: prevStep,
    stepStatus: "completed",
  });
  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessons.map((l) => l.id),
    step,
    stepStatus: "started",
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
    onSubmitted: async ({ openaiBatchId, filePath }) => {
      /**
       * Create batch record
       */
      const batch = await prisma.ingestOpenAiBatch.create({
        data: {
          ingestId,
          batchType: "embedding",
          openaiBatchId,
          inputFilePath: filePath,
          status: "pending",
        },
      });
      await prisma.ingestLessonPlanPart.updateMany({
        where: {
          id: {
            in: allParts.map((p) => p.lessonPlanPartId),
          },
        },
        data: {
          batchId: batch.id, // @todo this should not update all parts ids!!
        },
      });
    },
  });
}