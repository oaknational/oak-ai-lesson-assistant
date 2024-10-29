import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { Step } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { jsonlToArray } from "../utils/jsonlToArray";
import type { BatchTask} from "./customId";
import { getLessonIdFromCustomId } from "./customId";
import { downloadOpenAiFile } from "./downloadOpenAiFile";

function getStepFromTask(task: BatchTask): Step {
  switch (task) {
    case "generate-lesson-plans":
      return "lesson_plan_generation";
    case "embed-lesson-plan-parts":
      return "embedding";
  }
}

export async function handleOpenAiBatchErrorFile({
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
  const lessonIds = jsonArray.map((json) =>
    getLessonIdFromCustomId(json.custom_id),
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
      lessonPlan: {
        id: {
          in: lessonIds,
        },
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
