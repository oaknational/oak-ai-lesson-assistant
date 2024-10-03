import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";

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
