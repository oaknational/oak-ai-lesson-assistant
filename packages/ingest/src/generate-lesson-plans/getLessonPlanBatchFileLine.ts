import {
  CompletedLessonPlanSchema,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { zodResponseFormat } from "openai/helpers/zod";

import { PersistedIngest } from "../db-helpers/getIngestById";
import { batchLineCompletion } from "../openai-batches/batchLineCompletion";
import { createCustomId } from "../openai-batches/customId";
import { Captions, RawLesson } from "../zod-schema/zodSchema";
import { getSystemPrompt } from "./getSystemPrompt";
import { getUserPrompt } from "./getUserPrompt";

export function getLessonPlanBatchFileLine({
  ingest,
  lessonId,
  rawLesson,
  captions,
}: {
  ingest: PersistedIngest;
  lessonId: string;
  rawLesson: RawLesson;
  captions?: Captions;
}) {
  const { lessonTitle, keyStageSlug, subjectSlug } = rawLesson;
  const lessonPlan: LooseLessonPlan = {
    title: lessonTitle,
    keyStage: keyStageSlug,
    subject: subjectSlug,
  };

  for (const [key, value] of Object.entries(lessonPlan)) {
    if (!value) {
      throw new Error(`Missing ${key} for lesson ${lessonId}`);
    }
  }

  const systemPrompt = getSystemPrompt({
    rawLesson,
  });
  const userPrompt = getUserPrompt({
    rawLesson,
    captions,
    sourcePartsToInclude: ingest.config.sourcePartsToInclude,
  });

  const batchLine = batchLineCompletion({
    customId: createCustomId({ task: "generate-lesson-plans", lessonId }),
    model: ingest.config.completionModel,
    temperature: ingest.config.completionTemperature,
    systemPrompt,
    userPrompt,
    responseFormat: zodResponseFormat(CompletedLessonPlanSchema, "lesson_plan"),
  });

  return batchLine;
}
