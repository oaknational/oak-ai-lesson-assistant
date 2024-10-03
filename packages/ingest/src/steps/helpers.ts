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
  ingestId,
  batchId,
  errorFileId,
  customIdToLessonId,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  batchId: string;
  errorFileId: string;
  customIdToLessonId: (customId: string) => string;
}) {
  const { file } = await downloadOpenAiFile({
    fileId: errorFileId,
  });
  const text = await file.text();
  const lines = text.split("\n");
  const jsonArray = lines
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line));

  const lessonIds = jsonArray.map((json) => customIdToLessonId(json.custom_id));

  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds,
    step: "embedding",
    stepStatus: "failed",
  });
  await prisma.ingestOpenAiBatch.update({
    where: {
      id: batchId,
    },
    data: {
      errorFileId: errorFileId,
      status: "completed",
    },
  });
}

export function embeddingCustomIdToLessonId(customId: string) {
  const lessonId = customId.split("-")[0];
  if (!lessonId) {
    throw new IngestError("Invalid customId");
  }
  return lessonId;
}
export function getEmbeddingCustomId({
  lessonId,
  partKey,
}: {
  lessonId: string;
  partKey: string;
}) {
  return `${lessonId}-${partKey}`;
}
