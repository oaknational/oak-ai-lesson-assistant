import { PrismaClientWithAccelerate } from "@oakai/db";

import { Step } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { jsonlToArray } from "../utils/jsonlToArray";
import { BatchTask, parseCustomId } from "./customId";
import { downloadOpenAiFile } from "./downloadOpenAiFile";

function getStepFromTask(task: BatchTask): Step {
  switch (task) {
    case "generate-lesson-plans":
      return "lesson_plan_generation";
    case "embed-lesson-plan-parts":
      return "embedding";
  }
}

export async function handleOpenAIBatchErrorFile({
  prisma,
  ingestId,
  batchId,
  errorFileId,
  task,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
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

  await updateLessonsState({
    ingestId,
    prisma,
    lessonIds,
    step: getStepFromTask(task),
    stepStatus: "failed",
  });

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
