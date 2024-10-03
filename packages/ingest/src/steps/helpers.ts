import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { getDataHash } from "../utils/getDataHash";
import { Captions, RawLessonSchema } from "../zod-schema/zodSchema";

export const STEP = [
  "import",
  "captions_fetch",
  "lesson_plan_generation",
  "chunking",
  "embedding",
] as const;

const STEP_STATUS = ["started", "completed", "failed"] as const;

export type Step = (typeof STEP)[number];
type StepStatus = (typeof STEP_STATUS)[number];

export function getPrevStep(step: Step) {
  const index = STEP.indexOf(step);
  if (index === -1) {
    throw new IngestError("Invalid step passed to getPrevStep");
  }
  if (index === 0) {
    throw new IngestError("Cannot get previous step of the first step");
  }
  const prevStep = STEP[index - 1];
  if (!prevStep) {
    throw new IngestError("Could not get previous step");
  }

  return prevStep;
}

export async function getLatestIngestId({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingest = await prisma.ingest.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!ingest) {
    throw new IngestError("No ingest found");
  }
  return ingest.id;
}

export async function getLessonsByState({
  prisma,
  ingestId,
  step,
  stepStatus,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  step: Step;
  stepStatus: StepStatus;
}) {
  const lessons = await prisma.ingestLesson.findMany({
    where: {
      ingest: {
        status: "active",
      },
      ingestId,
      step,
      stepStatus,
    },
    include: {
      captions: true,
      lessonPlan: true,
      lessonPlanParts: true,
    },
  });
  return lessons.map((lesson) => ({
    ...lesson,
    data: RawLessonSchema.parse(lesson.data),
  }));
}

export async function updateLessonsState({
  prisma,
  ingestId,
  lessonIds,
  step,
  stepStatus,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lessonIds: string[];
  step: Step;
  stepStatus: StepStatus;
}) {
  return prisma.ingestLesson.updateMany({
    where: {
      ingestId,
      id: {
        in: lessonIds,
      },
    },
    data: {
      step,
      stepStatus,
    },
  });
}

export async function createErrorRecord({
  prisma,
  ingestId,
  lessonId,
  step,
  errorMessage,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lessonId: string;
  step: Step;
  errorMessage: string;
}) {
  return prisma.ingestError.create({
    data: {
      ingestId,
      lessonId,
      step,
      errorMessage,
    },
  });
}

export async function createCaptionsRecord({
  prisma,
  ingestId,
  lessonId,
  captions,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lessonId: string;
  captions: Captions;
}) {
  await prisma.$transaction(async () => {
    const captionsRecord = await prisma.ingestLessonCaptions.create({
      data: {
        ingestId,
        lessonId,
        data: captions,
        dataHash: getDataHash(captions),
      },
    });
    await prisma.ingestLesson.update({
      where: {
        id: lessonId,
      },
      data: {
        captionsId: captionsRecord.id,
      },
    });
  });
}

export async function handleOpenAIBatchErrorFile({
  prisma,
  batchId,
  errorFileId,
}: {
  prisma: PrismaClientWithAccelerate;
  batchId: string;
  errorFileId: string;
}) {
  const { file } = await downloadOpenAiFile({
    fileId: errorFileId,
  });
  const text = await file.text();
  const lines = text.split("\n");
  const jsonArray = lines
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line));

  await prisma.ingestLesson.updateMany({
    where: {
      OR: [
        {
          /**
           * In case of lesson plan generation, custom_id is lessonId
           */
          lessonPlanId: {
            in: jsonArray.map((json) => json.custom_id),
          },
        },
        {
          /**
           * In case of embedding, custom_id is lessonPlanPartId
           */
          lessonPlanParts: {
            some: {
              id: {
                in: jsonArray.map((json) => json.custom_id),
              },
            },
          },
        },
      ],
    },
    data: {
      stepStatus: "failed",
    },
  });

  await prisma.ingestOpenAiBatch.update({
    where: {
      id: batchId,
    },
    data: {
      errorFileId: errorFileId,
      receivedAt: new Date(),
      status: "completed",
    },
  });
}

export function parseEmbeddingCustomId(customId: string) {
  const [lessonId, lessonPlanPartId, partKey] = customId.split("-");
  if (!lessonId || !lessonPlanPartId || !partKey) {
    throw new IngestError("Invalid customId");
  }
  return { lessonId, lessonPlanPartId, partKey };
}
export function stringifyEmbeddingCustomId({
  lessonId,
  lessonPlanId,
  partKey,
}: {
  lessonId: string;
  lessonPlanId: string;
  partKey: string;
}) {
  const invalidKV = Object.entries({ lessonId, lessonPlanId, partKey }).find(
    ([, v]) => v.includes("-"),
  );
  if (invalidKV) {
    throw new IngestError(
      `Cannot create custom_id: ${invalidKV[0]} contains '-'`,
    );
  }

  return `${lessonId}-${lessonPlanId}-${partKey}`;
}
