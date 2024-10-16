import { PrismaClientWithAccelerate } from "@oakai/db";

import { getIngestById } from "../db-helpers/getIngestById";
import { loadLessonsAndUpdateState } from "../db-helpers/loadLessonsAndUpdateState";
import { Step, getPrevStep } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { startGenerating } from "../generate-lesson-plans/startGenerating";

const currentStep: Step = "lesson_plan_generation";
const prevStep = getPrevStep(currentStep);

/**
 * Get all lessons which are ready for lesson plan generation, and write
 * request batch, upload it, and submit it
 */
export async function lpBatchStart({
  prisma,
  ingestId,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
}) {
  const ingest = await getIngestById({ prisma, ingestId });
  const lessons = await loadLessonsAndUpdateState({
    prisma,
    ingestId,
    prevStep,
    currentStep,
  });

  if (lessons.length === 0) {
    console.log("No lessons to generate lesson plans for");
    return;
  }

  console.log(`Generating lesson plans for ${lessons.length} lessons`);

  try {
    await startGenerating({
      ingestId,
      ingest,
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
      step: currentStep,
      stepStatus: "failed",
    });
  }
}
