import { PrismaClientWithAccelerate } from "@oakai/db";

import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { getLessonsByState } from "../db-helpers/getLessonsByState";
import { Step, getPrevStep } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { startGenerating } from "../generate-lesson-plans/startGenerating";

const step: Step = "lesson_plan_generation";
const prevStep = getPrevStep(step);

/**
 * Get all lessons which are ready for lesson plan generation, and write
 * request batch, upload it, and submit it
 */
export async function lpBatchStart({
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

  if (lessons.length === 0) {
    console.log("No lessons to generate lesson plans for");
    return;
  }

  console.log(`Generating lesson plans for ${lessons.length} lessons`);

  try {
    await startGenerating({
      ingestId,
      lessons,
      onSubmitted: async ({ openaiBatchId, filePath }) => {
        await prisma.ingestOpenAiBatch.create({
          data: {
            ingestId,
            batchType: "lesson_plan_generation",
            openaiBatchId: openaiBatchId,
            inputFilePath: filePath,
            status: "pending",
          },
        });
      },
    });
  } catch (error) {
    console.error("Error generating lesson plans", error);
    await updateLessonsState({
      prisma,
      ingestId,
      lessonIds: lessons.map((l) => l.id),
      step,
      stepStatus: "failed",
    });
  }
}
