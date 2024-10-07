import { PrismaClientWithAccelerate } from "@oakai/db";

import { BatchTask, parseCustomId } from "../openai-batches/customId";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { jsonlToArray } from "../utils/jsonlToArray";

export async function handleOpenAIBatchErrorFile({
  prisma,
  batchId,
  errorFileId,
  task,
}: {
  prisma: PrismaClientWithAccelerate;
  batchId: string;
  errorFileId: string;
  task: BatchTask;
}) {
  const { file } = await downloadOpenAiFile({
    fileId: errorFileId,
  });
  const text = await file.text();
  const jsonArray = jsonlToArray(text);
  const lessonIds = jsonArray.map(
    (json) =>
      parseCustomId({
        task,
        customId: json.custom_id,
      }).lessonId,
  );

  await prisma.ingestLesson.updateMany({
    where: {
      lessonPlanId: {
        in: lessonIds,
      },
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
      errorFileId,
      receivedAt: new Date(),
      status: "completed",
    },
  });
}
