import {
  CompletedLessonPlanSchema,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { zodResponseFormat } from "openai/helpers/zod";

import { createCustomId } from "../openai-batches/customId";
import { Captions, RawLesson } from "../zod-schema/zodSchema";
import { getSystemPrompt } from "./getSystemPrompt";
import { getUserPrompt } from "./getUserPrompt";

export function getLessonPlanBatchFileLine({
  lessonId,
  rawLesson,
  captions,
}: {
  lessonId: string;
  rawLesson: RawLesson;
  captions: Captions;
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
  });

  const batchRequest = {
    custom_id: createCustomId({ task: "generate-lesson-plans", lessonId }),
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(
        CompletedLessonPlanSchema,
        "lesson_plan",
      ),
    },
  };

  return batchRequest;
}
